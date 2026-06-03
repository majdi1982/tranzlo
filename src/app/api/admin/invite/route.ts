import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Account, ID, Query } from "node-appwrite";
import nodemailer from "nodemailer";
import crypto from "crypto";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

// Initialize admin appwrite client
function getAdminClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
  if (apiKey) {
    client.setKey(apiKey);
  }
  return client;
}

// Helper to verify admin permissions from user session
async function verifyAdminUser(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`a_session_${projectId}`);
  if (!sessionCookie) return false;

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
  client.setSession(sessionCookie.value);

  const account = new Account(client);
  try {
    const user = await account.get();
    const role = user.prefs?.role;
    return role === "admin";
  } catch (err) {
    return false;
  }
}

// POST: Create a new invitation and send via SMTP
export async function POST(req: Request) {
  try {
    const isAdmin = await verifyAdminUser();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role, profession, permissions } = await req.json();
    if (!email || !role || !profession) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

    const client = getAdminClient();
    const databases = new Databases(client);

    // Save invitation to DB
    const invitation = await databases.createDocument(
      dbId,
      "team_invitations",
      ID.unique(),
      {
        email,
        token,
        role,
        profession,
        permissions: permissions || [],
        isUsed: false,
        expiresAt,
      }
    );

    // Send invitation email
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://tranzlo.net").replace(/\/$/, "");
    const inviteLink = `${appUrl}/admin/register?token=${token}&email=${encodeURIComponent(email)}`;

    const host = process.env.SMTP_HOST || "smtp.hostinger.com";
    const port = parseInt(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER || "help@tranzlo.net";
    const pass = process.env.SMTP_PASSWORD || "Cdromlg@8442";
    const from = process.env.SMTP_FROM || "support@tranzlo.net";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #0ea5e9; margin-bottom: 20px;">Tranzlo Team Invitation</h2>
        <p>Hello,</p>
        <p>You have been invited to join the Tranzlo administrative team as a <strong>${role.toUpperCase()}</strong> (${profession}).</p>
        <p>This invitation gives you access to the team dashboard with the following permissions:</p>
        <ul style="padding-left: 20px; margin-bottom: 25px;">
          ${(permissions || []).map((p: string) => `<li style="margin-bottom: 6px; font-weight: 500;">${p.replace(/_/g, " ")}</li>`).join("")}
        </ul>
        <p>Please complete your account registration by clicking the button below:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${inviteLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Registration</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="color: #64748b; font-size: 11px;">This invitation will expire in 48 hours. If you did not expect this invitation, you can ignore this email safely.</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject: "Invitation to join Tranzlo Administrative Team",
      html: htmlContent
    });

    return NextResponse.json({ success: true, invitation });
  } catch (err: any) {
    console.error("Failed to process invitation:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

// GET: Retrieve invitations (for list)
export async function GET() {
  try {
    const isAdmin = await verifyAdminUser();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getAdminClient();
    const databases = new Databases(client);

    const result = await databases.listDocuments(
      dbId,
      "team_invitations",
      [Query.orderDesc("$createdAt")]
    );

    return NextResponse.json({ invitations: result.documents });
  } catch (err: any) {
    console.error("Failed to list invitations:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Revoke/Delete invitation
export async function DELETE(req: Request) {
  try {
    const isAdmin = await verifyAdminUser();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const client = getAdminClient();
    const databases = new Databases(client);
    await databases.deleteDocument(dbId, "team_invitations", id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to revoke invitation:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
