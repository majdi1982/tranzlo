import { NextResponse } from "next/server";
import { Client, Databases, ID } from "node-appwrite";

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
    const bodyText = await req.text();
    const event = JSON.parse(bodyText);

    console.log("🔔 Incoming PayPal Webhook Event:", event.event_type);

    const adminClient = getAdminClient();
    const db = new Databases(adminClient);

    const resource = event.resource;
    let userId = resource?.custom_id;

    if (!userId && resource?.purchase_units?.[0]?.custom_id) {
      userId = resource.purchase_units[0].custom_id;
    }

    // Always create an admin notification (assuming admin has a known ID, or we just log it)
    // Here we'll notify the user if userId is found
    if (userId) {
      await db.createDocument(dbId, "notifications", ID.unique(), {
        userId: userId,
        type: "payment_success",
        title: "✅ PayPal Payment Successful",
        body: `Your payment of $${resource?.amount?.value || resource?.gross_amount?.value || "..."} was processed successfully via PayPal.`,
        data: JSON.stringify({ event_type: event.event_type, id: event.id }),
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    // You could also create a ledger entry here based on the event type.

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error("PayPal Webhook Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
