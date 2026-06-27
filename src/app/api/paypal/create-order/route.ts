import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { cookies } from "next/headers";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

const paypalMode = process.env.PAYPAL_MODE || "sandbox";
const paypalClientId = paypalMode === "live" ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_SANDBOX_CLIENT_ID;
const paypalClientSecret = paypalMode === "live" ? process.env.PAYPAL_SECRET_KEY : process.env.PAYPAL_SANDBOX_SECRET_KEY;
const host = paypalMode === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com";

// Use user's session to query the DB securely
function getUserClient(sessionCookie: string) {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
  client.setSession(sessionCookie);
  return client;
}

export async function POST(req: Request) {
  try {
    const { amount, referenceId, description } = await req.json();

    if (!amount || !referenceId) {
      return NextResponse.json({ error: "amount and referenceId are required" }, { status: 400 });
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

    // 2. Create PayPal Order
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: referenceId,
          description: description || `Tranzlo Payment`,
          amount: {
            currency_code: "USD",
            value: parseFloat(amount).toFixed(2)
          }
        }
      ]
    };

    const orderRes = await fetch(`https://${host}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderPayload)
    });

    if (!orderRes.ok) {
      console.error("PayPal Create Order Failed", await orderRes.text());
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
    }

    const orderData = await orderRes.json();

    return NextResponse.json({ id: orderData.id });
  } catch (err: any) {
    console.error("Create Order Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
