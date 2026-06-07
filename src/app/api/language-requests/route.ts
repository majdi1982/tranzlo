import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Account, ID, Query } from "node-appwrite";

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

async function getAuthenticatedUser(req: Request) {
  const userClient = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  let authenticated = false;
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

  if (!authenticated) return null;

  try {
    const account = new Account(userClient);
    return await account.get();
  } catch (err) {
    return null;
  }
}

// GET /api/language-requests
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.$id;
    const userRole = user.prefs?.role || "translator";

    const adminClient = getAdminClient();
    const db = new Databases(adminClient);

    let queries = [Query.orderDesc("createdAt"), Query.limit(100)];

    // If not admin/staff, only show requests for this user
    if (userRole !== "admin" && userRole !== "staff") {
      queries.push(Query.equal("userId", userId));
    }

    const requests = await db.listDocuments(dbId, "language_change_requests", queries);
    return NextResponse.json({ requests: requests.documents });
  } catch (error: any) {
    console.error("GET language-requests error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
  }
}

// POST /api/language-requests
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.$id;
    const userRole = user.prefs?.role || "translator";

    if (userRole !== "translator") {
      return NextResponse.json({ error: "Only translators can request language changes." }, { status: 403 });
    }

    const { requestedLanguages, reason } = await req.json();

    if (!requestedLanguages || !Array.isArray(requestedLanguages) || requestedLanguages.length === 0) {
      return NextResponse.json({ error: "At least one language must be requested." }, { status: 400 });
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json({ error: "A valid reason (minimum 5 characters) must be provided." }, { status: 400 });
    }

    const adminClient = getAdminClient();
    const db = new Databases(adminClient);

    // Fetch translator profile
    const profileResult = await db.listDocuments(
      dbId,
      "translator_profiles",
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (profileResult.documents.length === 0) {
      return NextResponse.json({ error: "Translator profile not found." }, { status: 404 });
    }

    const profile = profileResult.documents[0];
    const currentLanguages = profile.languages || [];

    // Check if there's already a pending request
    const pendingResult = await db.listDocuments(
      dbId,
      "language_change_requests",
      [
        Query.equal("userId", userId),
        Query.equal("status", "pending"),
        Query.limit(1)
      ]
    );

    if (pendingResult.documents.length > 0) {
      return NextResponse.json({ error: "You already have a pending change request. Please wait for the administrator to review it." }, { status: 400 });
    }

    // Create request document
    const requestDoc = await db.createDocument(
      dbId,
      "language_change_requests",
      ID.unique(),
      {
        userId,
        translatorName: profile.fullName || "Translator",
        currentLanguages: JSON.stringify(currentLanguages),
        requestedLanguages: JSON.stringify(requestedLanguages),
        reason: reason.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true, request: requestDoc });
  } catch (error: any) {
    console.error("POST language-requests error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit request" }, { status: 500 });
  }
}
