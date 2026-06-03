import { NextResponse } from "next/server";
import { Client, Databases, Users, ID, Query } from "node-appwrite";

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
    const { token, email, name, password } = await req.json();
    if (!token || !email || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = getAdminClient();
    const databases = new Databases(client);
    const users = new Users(client);

    // 1. Verify invitation token
    const result = await databases.listDocuments(
      dbId,
      "team_invitations",
      [
        Query.equal("token", token),
        Query.equal("email", email),
        Query.equal("isUsed", false),
        Query.limit(1)
      ]
    );

    if (result.documents.length === 0) {
      return NextResponse.json({ error: "Invalid, expired, or already used invitation token." }, { status: 400 });
    }

    const invite = result.documents[0];
    const now = new Date().getTime();
    const expiry = new Date(invite.expiresAt).getTime();

    if (now > expiry) {
      return NextResponse.json({ error: "This invitation token has expired." }, { status: 400 });
    }

    // 2. Create the administrative user in Appwrite Auth
    const user = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      name
    );

    // 3. Store role, profession, and permissions in user preferences
    await users.updatePrefs(user.$id, {
      role: invite.role, // e.g. "admin", "staff", "financial", "support"
      profession: invite.profession,
      permissions: invite.permissions || [],
      onboardingComplete: true, // Bypass onboarding
    });

    // 4. Mark token as used
    await databases.updateDocument(
      dbId,
      "team_invitations",
      invite.$id,
      { isUsed: true }
    );

    return NextResponse.json({ success: true, userId: user.$id });
  } catch (err: any) {
    console.error("Failed to complete administrative registration:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
