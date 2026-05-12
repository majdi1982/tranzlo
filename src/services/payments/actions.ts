"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";
import { generateTrzId } from "@/lib/redis";
import { logAudit } from "@/services/audit/actions";
import { sendNotification } from "@/services/notifications/actions";

const PAYPAL_API = process.env.NODE_ENV === "production" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

/**
 * PAYPAL SERVICE - ESCROW & PAYMENTS
 * Adheres to MASTER SYSTEM ARCHITECTURE and DATABASE SCHEMA LAW.
 */

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await response.json();
  return data.access_token;
}

export async function createEscrowOrder(jobId: string, amount: number) {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: jobId,
          amount: {
            currency_code: "USD",
            value: amount.toString(),
          },
          description: `Escrow payment for Job ID: ${jobId}`,
        },
      ],
    }),
  });

  const order = await response.json();
  return { success: true, orderId: order.id };
}

export async function verifyPaymentAndStartJob(jobId: string, orderId: string, translatorId: string) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();
  const accessToken = await getPayPalAccessToken();

  try {
    // 1. Capture the payment
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await response.json();

    if (captureData.status !== "COMPLETED") {
      throw new Error("Payment not completed");
    }

    const now = new Date().toISOString();

    // 2. Update Job Status to 'reviewing' or 'active' (In Progress)
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId,
      { 
        status: "reviewing", // Assuming 'reviewing' is used for In Progress in the law or we use 'active'
        hiredTranslatorId: translatorId,
        updatedAt: now,
        updatedBy: user.$id
      }
    );

    // 3. Log Audit
    await logAudit(user.$id, "payment", "job", jobId, { orderId, amount: captureData.purchase_units[0].payments.captures[0].amount.value });

    // 4. Notify Translator
    await sendNotification({
      userId: translatorId,
      type: "success",
      content: "Congratulations! You have been hired. The funds are held in escrow.",
      link: `/dashboard/jobs/${jobId}`
    });

    return { success: true };
  } catch (error: any) {
    console.error("Payment Verification Error:", error.message);
    return { error: error.message };
  }
}
