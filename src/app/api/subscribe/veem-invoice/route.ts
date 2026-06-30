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
    const { userId, planTier, email, isAnnual } = await req.json();

    if (!userId || !planTier || !email) {
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

    const userRole = user.prefs?.role || "translator";
    const adminClient = getAdminClient();
    const db = new Databases(adminClient);

    // 2. Resolve Plan Price
    const planPrices: Record<string, number> = {
      plus: isAnnual ? 9.99 * 10 : 9.99,
      pro: isAnnual ? 19.99 * 10 : 19.99
    };

    const price = planPrices[planTier.toLowerCase()] || 0.00;
    if (price <= 0) {
      return NextResponse.json({ error: "Invalid plan or plan price." }, { status: 400 });
    }

    // 3. Create Veem Invoice API Request
    const veemMode = process.env.VEEM_MODE || "sandbox";
    const veemClientId = process.env.VEEM_CLIENT_ID;
    const veemClientSecret = process.env.VEEM_CLIENT_SECRET;

    if (!veemClientId || !veemClientSecret) {
      console.error("Veem credentials missing in environment variables");
      return NextResponse.json({ error: "Veem subscription service is currently unavailable." }, { status: 500 });
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
      return NextResponse.json({ error: "Failed to authenticate with Veem subscription service." }, { status: 500 });
    }

    const authData = await authRes.json();
    const veemAccessToken = authData.access_token;

    // Create Veem Invoice (Request Payment)
    const invoicePayload = {
      amount: {
        number: price,
        currency: "USD"
      },
      payer: {
        email: email.trim(),
        firstName: user.name || "Tranzlo",
        lastName: "Customer",
        countryCode: "US"
      },
      notes: `Subscription upgrade to Tranzlo ${planTier.toUpperCase()} (${isAnnual ? "Annual" : "Monthly"}).`,
      lineItems: [
        {
          description: `Tranzlo ${planTier.toUpperCase()} Plan Upgrade`,
          amount: price,
          qty: 1,
          entryType: "CHARGE"
        }
      ]
    };

    const requestId = `veem_invoice_${userId}_${Date.now()}`;
    const invoiceRes = await fetch(`https://${veemHost}/veem/v1.2/invoices`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${veemAccessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Request-Id": requestId
      },
      body: JSON.stringify(invoicePayload)
    });

    if (!invoiceRes.ok) {
      const errText = await invoiceRes.text();
      console.error("Veem Invoice Creation Error:", errText);
      return NextResponse.json({ error: "Failed to send invoice request via Veem." }, { status: 500 });
    }

    const invoiceData = await invoiceRes.json();
    const invoiceId = invoiceData.id ? invoiceData.id.toString() : "unknown_invoice";

    // 4. Sandbox Mode Instant Database Upgrade
    const profileCollection = userRole === "translator" ? "translator_profiles" : "company_profiles";
    const profileResult = await db.listDocuments(
      dbId,
      profileCollection,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (profileResult.documents.length === 0) {
      return NextResponse.json({ error: "User profile not found in database." }, { status: 404 });
    }

    const profile = profileResult.documents[0];
    
    // Calculate Plan Expiration Date (1 month or 1 year)
    const expiryDate = new Date();
    if (isAnnual) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    await db.updateDocument(dbId, profileCollection, profile.$id, {
      planTier: planTier.toLowerCase(),
      planExpiresAt: expiryDate.toISOString(),
      paypalSubscriptionId: `VEEM_INV_${invoiceId}`, // tracking using Veem invoice id
      updatedAt: new Date().toISOString()
    });

    // 5. Record Transaction in ledger
    await db.createDocument(dbId, "transactions_ledger", ID.unique(), {
      transactionId: invoiceId,
      code: `subscription_${userId}_${Date.now()}`,
      userId: userId,
      userName: user.name || "Customer User",
      userEmail: email.trim(),
      type: "subscription",
      planTier: planTier.toLowerCase(),
      amount: price,
      feeDeducted: 0,
      status: "released",
      transferStatus: "completed",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Veem Invoice sent successfully to ${email}. In Sandbox mode, your account has been instantly upgraded to ${planTier.toUpperCase()}!`,
      invoiceId
    });

  } catch (err: any) {
    console.error("Veem Subscription API failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
