import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Account, Query } from "node-appwrite";

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
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    // 1. Authenticate user from session cookie or JWT header
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

    const userId = user.$id;
    const userRole = user.prefs?.role || "translator";

    const adminClient = getAdminClient();
    const db = new Databases(adminClient);

    // 2. Fetch and validate promo code
    const promoResult = await db.listDocuments(
      dbId,
      "promo_codes",
      [Query.equal("code", code.trim()), Query.limit(1)]
    );

    if (promoResult.documents.length === 0) {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
    }

    const promo = promoResult.documents[0];

    if (!promo.isActive) {
      return NextResponse.json({ error: "This promo code is no longer active." }, { status: 400 });
    }

    if (promo.expiresAt) {
      const now = new Date().getTime();
      const expiry = new Date(promo.expiresAt).getTime();
      if (now > expiry) {
        return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
      }
    }

    if (promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 400 });
    }

    // 3. Fetch user profile
    const profileCollection = userRole === "translator" ? "translator_profiles" : "company_profiles";
    const profileResult = await db.listDocuments(
      dbId,
      profileCollection,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (profileResult.documents.length === 0) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const profile = profileResult.documents[0];

    // Check if they already have an active promo plan or used this code
    if (profile.promoCodeUsed) {
      return NextResponse.json({ error: "You have already redeemed a promo code on this account." }, { status: 400 });
    }

    // 4. Calculate subscription expiry date
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + promo.durationMonths);
    const planExpiresAt = expiryDate.toISOString();

    // 5. Update user profile to upgraded tier
    await db.updateDocument(dbId, profileCollection, profile.$id, {
      planTier: promo.planTier,
      planExpiresAt,
      promoCodeUsed: promo.code,
      updatedAt: new Date().toISOString()
    });

    // 6. Update usedCount on promo code
    await db.updateDocument(dbId, "promo_codes", promo.$id, {
      usedCount: promo.usedCount + 1,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${promo.planTier === "pro" ? "Pro" : "Plus"} plan for ${promo.durationMonths} months!`,
      planTier: promo.planTier,
      planExpiresAt
    });

  } catch (err: any) {
    console.error("Failed to redeem promo code:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
