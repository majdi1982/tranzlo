import { NextResponse } from "next/server";
import { Client, Databases, ID } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

const paypalMode = process.env.PAYPAL_MODE || "sandbox";
const paypalClientId = paypalMode === "live" ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_SANDBOX_CLIENT_ID;
const paypalClientSecret = paypalMode === "live" ? process.env.PAYPAL_SECRET_KEY : process.env.PAYPAL_SANDBOX_SECRET_KEY;
const host = paypalMode === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com";

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
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "orderID is required" }, { status: 400 });
    }

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal credentials not configured on the server.");
    }

    // 1. Get PayPal Access Token
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
      console.error("PayPal Auth Failed", await authRes.text());
      return NextResponse.json({ error: "Failed to authenticate with PayPal" }, { status: 500 });
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 2. Capture the PayPal Order
    const captureRes = await fetch(`https://${host}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!captureRes.ok) {
      console.error("PayPal Capture Order Failed", await captureRes.text());
      return NextResponse.json({ error: "Failed to capture PayPal order" }, { status: 500 });
    }

    const captureData = await captureRes.json();

    // PayPal returns 'COMPLETED' for successful captures
    if (captureData.status !== "COMPLETED") {
      return NextResponse.json({ error: "PayPal order not completed" }, { status: 400 });
    }

    // Capture ID is deep in the purchase_units
    const captureId = captureData.purchase_units[0]?.payments?.captures[0]?.id || orderID;

    return NextResponse.json({ success: true, captureId });
  } catch (err: any) {
    console.error("Capture Order Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
