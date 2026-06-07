import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Account } from "node-appwrite";

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

// PATCH /api/language-requests/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = user.prefs?.role || "translator";
    if (userRole !== "admin" && userRole !== "staff") {
      return NextResponse.json({ error: "Forbidden. Admin or Staff privileges required." }, { status: 403 });
    }

    const { status, adminNote } = await req.json();
    const { id: requestId } = await params;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value. Must be 'approved' or 'rejected'." }, { status: 400 });
    }

    const adminClient = getAdminClient();
    const db = new Databases(adminClient);

    // Fetch the request
    let requestDoc;
    try {
      requestDoc = await db.getDocument(dbId, "language_change_requests", requestId);
    } catch (err) {
      return NextResponse.json({ error: "Language request not found." }, { status: 404 });
    }

    if (requestDoc.status !== "pending") {
      return NextResponse.json({ error: "This request has already been processed." }, { status: 400 });
    }

    const targetUserId = requestDoc.userId;
    const requestedLangs: string[] = JSON.parse(requestDoc.requestedLanguages);

    if (status === "approved") {
      // 1. Fetch translator profile
      const profileResult = await db.listDocuments(
        dbId,
        "translator_profiles",
        [
          ...[Query ? Query.equal("userId", targetUserId) : `userId=${targetUserId}`],
          ...[Query ? Query.limit(1) : ""]
        ].filter(Boolean)
      );

      if (profileResult.documents.length === 0) {
        return NextResponse.json({ error: "Translator profile not found for this request." }, { status: 404 });
      }

      const profile = profileResult.documents[0];

      // 2. Clean up native language if no longer in requested languages
      let newNativeLang = profile.nativeLanguage || "";
      if (newNativeLang && !requestedLangs.includes(newNativeLang)) {
        newNativeLang = requestedLangs[0] || "";
      }

      // 3. Clean up language pairs to only include valid pairs
      let newLanguagePairsStr = "";
      if (profile.languagePairs) {
        try {
          const pairs = typeof profile.languagePairs === "string"
            ? JSON.parse(profile.languagePairs)
            : profile.languagePairs;

          if (Array.isArray(pairs)) {
            const validPairs = pairs.filter((p: any) => 
              requestedLangs.includes(p.source) && requestedLangs.includes(p.target)
            );
            newLanguagePairsStr = JSON.stringify(validPairs);
          }
        } catch (e) {
          console.error("Failed to parse/filter language pairs on approval:", e);
        }
      }

      // 4. Update the profile (resetting verification status to require re-verification)
      await db.updateDocument(dbId, "translator_profiles", profile.$id, {
        languages: requestedLangs,
        nativeLanguage: newNativeLang,
        languagePairs: newLanguagePairsStr,
        isVerified: false,
        verificationStatus: "unverified",
        updatedAt: new Date().toISOString()
      });
    }

    // 5. Update the request document status
    const updatedRequest = await db.updateDocument(dbId, "language_change_requests", requestId, {
      status,
      adminNote: adminNote || "",
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error: any) {
    console.error("PATCH language-requests error:", error);
    return NextResponse.json({ error: error.message || "Failed to update request" }, { status: 500 });
  }
}

// Support node-appwrite version differences dynamically
const Query = require("node-appwrite").Query;
