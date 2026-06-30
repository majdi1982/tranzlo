import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Account, Query, ID } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

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
    const { userId, veemEmail } = await req.json();

    if (!userId || !veemEmail) {
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

    // 3. Veem Payout Integration
    const veemMode = process.env.VEEM_MODE || "sandbox";
    const veemClientId = process.env.VEEM_CLIENT_ID;
    const veemClientSecret = process.env.VEEM_CLIENT_SECRET;

    if (!veemClientId || !veemClientSecret) {
      console.error("Veem credentials missing in environment variables");
      return NextResponse.json({ error: "Veem payout service is currently unavailable." }, { status: 500 });
    }

    const veemHost = veemMode === "live" ? "api.veem.com" : "sandbox-api.veem.com";

    // Obtain Veem Access Token
    const veemAuth = Buffer.from(`${veemClientId}:${veemClientSecret}`).toString("base64");
    const authRes = await fetch(`https://${veemHost}/oauth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${veemAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: "grant_type=client_credentials&scope=all"
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error("Veem Auth Error:", errText);
      return NextResponse.json({ error: "Failed to authenticate with Veem payout service." }, { status: 500 });
    }

    const authData = await authRes.json();
    const veemAccessToken = authData.access_token;

    // List Funding Methods to get the default source of funds
    const fundingMethodsRes = await fetch(`https://${veemHost}/veem/v1.2/funding-methods`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${veemAccessToken}`,
        "Accept": "application/json",
        "X-Request-Id": `fm_check_${userId}_${Date.now()}`
      }
    });

    if (!fundingMethodsRes.ok) {
      const errText = await fundingMethodsRes.text();
      console.error("Veem Fetch Funding Methods Error:", errText);
      return NextResponse.json({ error: "Failed to retrieve funding source from Veem." }, { status: 500 });
    }

    const fundingData = await fundingMethodsRes.json();
    let selectedFundingMethod = null;
    if (fundingData.fundingMethods && fundingData.fundingMethods.length > 0) {
      selectedFundingMethod = fundingData.fundingMethods.find(
        (m: any) => m.defaultMethod?.defaultDebitMethod || m.defaultMethod?.defaultCreditMethod
      ) || fundingData.fundingMethods[0];
    }

    if (!selectedFundingMethod) {
      console.error("No funding method available in Veem account");
      return NextResponse.json({ error: "No funding method configured in the Veem account." }, { status: 500 });
    }

    // Split translator's name and normalize country code
    const nameParts = (profile.fullName || "Translator User").trim().split(/\s+/);
    const firstName = nameParts[0] || "Translator";
    const lastName = nameParts.slice(1).join(" ") || "User";

    let countryCode = "US";
    if (profile.country && profile.country.trim().length === 2) {
      countryCode = profile.country.trim().toUpperCase();
    } else {
      const countryMap: Record<string, string> = {
        "egypt": "EG",
        "united states": "US",
        "usa": "US",
        "canada": "CA",
        "united kingdom": "GB",
        "uk": "GB",
        "australia": "AU"
      };
      const normalizedCountry = (profile.country || "").trim().toLowerCase();
      if (countryMap[normalizedCountry]) {
        countryCode = countryMap[normalizedCountry];
      }
    }

    // Create Veem Payment Payload
    const veemPaymentPayload = {
      amount: {
        number: parseFloat(balance.toString()),
        currency: "USD"
      },
      fundingMethod: {
        type: selectedFundingMethod.type,
        id: selectedFundingMethod.id
      },
      payee: {
        email: veemEmail.trim(),
        firstName: firstName,
        lastName: lastName,
        countryCode: countryCode,
        type: "Incomplete"
      },
      purposeOfPayment: "Goods",
      purposeOfPaymentDescription: "Manual withdrawal payout from Tranzlo.",
      notes: `Withdrawal of $${balance.toFixed(2)} from Tranzlo.`
    };

    const requestId = `veem_withdraw_${userId}_${Date.now()}`;
    const paymentRes = await fetch(`https://${veemHost}/veem/v1.2/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${veemAccessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Request-Id": requestId
      },
      body: JSON.stringify(veemPaymentPayload)
    });

    if (!paymentRes.ok) {
      const errText = await paymentRes.text();
      console.error("Veem Payment Error:", errText);
      return NextResponse.json({ error: "Failed to execute payout via Veem. Please check recipient details." }, { status: 500 });
    }

    const paymentData = await paymentRes.json();
    const payoutId = paymentData.id ? paymentData.id.toString() : "unknown_payment";

    // 4. Update translator profile (zero balance and update email)
    await db.updateDocument(dbId, "translator_profiles", profile.$id, {
      availableBalance: 0,
      veemEmail: veemEmail.trim(),
      updatedAt: new Date().toISOString()
    });

    // 5. Record transaction in ledger (fixed to match transactions_ledger schema)
    await db.createDocument(dbId, "transactions_ledger", ID.unique(), {
      transactionId: payoutId,
      code: `withdrawal_${userId}_${Date.now()}`,
      userId: userId,
      userName: profile.fullName || "Translator User",
      userEmail: profile.email || "",
      type: "withdrawal",
      planTier: profile.planTier || "free",
      amount: balance,
      feeDeducted: 0,
      status: "released",
      transferStatus: "completed",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Successfully withdrew $${balance.toFixed(2)} to ${veemEmail} via Veem.`,
      batchId: payoutId
    });

  } catch (err: any) {
    console.error("Withdrawal API failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
