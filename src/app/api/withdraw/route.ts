import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Account, Query, ID } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

const paypalMode = process.env.PAYPAL_MODE || "sandbox";
const paypalClientId = paypalMode === "live" ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_SANDBOX_CLIENT_ID;
const paypalClientSecret = paypalMode === "live" ? process.env.PAYPAL_SECRET_KEY : process.env.PAYPAL_SANDBOX_SECRET_KEY;

function getAdminClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
  if (apiKey) {
    client.setKey(apiKey);
  }
  return client;
}

export async function POST(req: Request) {
  try {
    const { userId, paypalEmail } = await req.json();

    if (!userId || !paypalEmail) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Authenticate user from session
    let authenticated = false;
    const userClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwt = authHeader.substring(7);
      userClient.setJWT(jwt);
      authenticated = true;
    } else {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(`a_session_${projectId}`) || cookieStore.get(`a_session_${projectId.toLowerCase()}`);
      if (sessionCookie) {
        userClient.setSession(sessionCookie.value);
        authenticated = true;
      }
    }

    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const account = new Account(userClient);
    let user;
    try {
      user = await account.get();
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized. Session invalid or expired." }, { status: 401 });
    }

    if (user.$id !== userId) {
      return NextResponse.json({ error: "Forbidden. Invalid user ID." }, { status: 403 });
    }

    const adminClient = getAdminClient();
    const db = new Databases(adminClient);

    // 2. Fetch translator profile and check balance
    const profileResult = await db.listDocuments(
      dbId,
      "translator_profiles",
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (profileResult.documents.length === 0) {
      return NextResponse.json({ error: "Translator profile not found." }, { status: 404 });
    }

    const profile = profileResult.documents[0];
    const balance = profile.availableBalance || 0;

    if (balance <= 0) {
      return NextResponse.json({ error: "Insufficient balance to withdraw." }, { status: 400 });
    }

    // 3. Obtain PayPal Access Token
    if (!paypalClientId || !paypalClientSecret) {
      console.error("PayPal credentials missing in environment variables");
      return NextResponse.json({ error: "Payout service is currently unavailable." }, { status: 500 });
    }

    const host = paypalMode === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com";
    const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64");
    
    const authRes = await fetch(`https://${host}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error("PayPal Auth Error:", errText);
      return NextResponse.json({ error: "Failed to authenticate with payment provider." }, { status: 500 });
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 4. Send PayPal Payout API Request
    const batchId = `withdraw_${userId}_${Date.now()}`;
    const payoutPayload = {
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: "You have received a withdrawal from Tranzlo!",
        recipient_type: "EMAIL"
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: parseFloat(balance.toString()).toFixed(2),
            currency: "USD"
          },
          note: `Manual withdrawal from Tranzlo Available Balance.`,
          receiver: paypalEmail.trim(),
          sender_item_id: `bal_${userId}`
        }
      ]
    };

    const payoutRes = await fetch(`https://${host}/v1/payments/payouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payoutPayload)
    });

    if (!payoutRes.ok) {
      const errText = await payoutRes.text();
      console.error("PayPal Payout Error:", errText);
      return NextResponse.json({ error: "Failed to process payment. Please ensure your PayPal email is correct." }, { status: 500 });
    }

    const payoutData = await payoutRes.json();
    const paypalBatchId = payoutData.batch_header?.payout_batch_id || "unknown_batch";

    // 5. Update translator profile (zero balance and update email)
    await db.updateDocument(dbId, "translator_profiles", profile.$id, {
      availableBalance: 0,
      paypalEmail: paypalEmail.trim(),
      updatedAt: new Date().toISOString()
    });

    // 6. Record transaction in ledger
    await db.createDocument(dbId, "transactions_ledger", ID.unique(), {
      userId: userId,
      type: "withdrawal",
      amount: balance,
      currency: "USD",
      status: "completed",
      paymentMethod: "paypal_payout",
      paymentId: paypalBatchId,
      description: `Manual withdrawal to ${paypalEmail}`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Successfully withdrew $${balance.toFixed(2)} to ${paypalEmail}`,
      batchId: paypalBatchId
    });

  } catch (err: any) {
    console.error("Withdrawal API failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
