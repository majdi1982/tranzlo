import { ID, Query } from "node-appwrite";
import {
  appwriteDatabaseId,
  appwritePayPalEventsCollectionId,
  appwriteSubscriptionsCollectionId,
  createAdminDatabases,
} from "@/lib/appwrite/server-admin";
import { PAYPAL_PLAN_MAP } from "@/lib/paypal-plan-map";
import { verifyPayPalWebhook } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  create_time?: string;
  summary?: string;
  resource?: Record<string, any>;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function addDaysISO(dateInput: string | Date, days: number): string {
  const date = new Date(dateInput);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

async function alreadyProcessed(eventId: string): Promise<boolean> {
  const adminDatabases = createAdminDatabases();
  const result = await adminDatabases.listDocuments(
    appwriteDatabaseId,
    appwritePayPalEventsCollectionId,
    [Query.equal("event_id", [eventId])]
  );

  return result.documents.length > 0;
}

async function markProcessed(event: PayPalWebhookEvent): Promise<void> {
  const adminDatabases = createAdminDatabases();
  await adminDatabases.createDocument(
    appwriteDatabaseId,
    appwritePayPalEventsCollectionId,
    ID.unique(),
    {
      event_id: event.id,
      event_type: event.event_type,
      summary: event.summary ?? null,
      processed_at: new Date().toISOString(),
    }
  );
}

async function findSubscriptionByProviderId(providerSubscriptionId: string) {
  const adminDatabases = createAdminDatabases();
  const result = await adminDatabases.listDocuments(
    appwriteDatabaseId,
    appwriteSubscriptionsCollectionId,
    [Query.equal("provider_subscription_id", [providerSubscriptionId])]
  );

  return result.documents[0] ?? null;
}

async function createOrUpdateSubscriptionFromWebhook(
  event: PayPalWebhookEvent,
  patch: Record<string, any>
) {
  const adminDatabases = createAdminDatabases();
  const resource = event.resource ?? {};
  const providerSubscriptionId =
    resource.id || resource.billing_agreement_id || resource.sale_id || null;

  if (!providerSubscriptionId) {
    throw new Error("Missing provider subscription id in webhook resource");
  }

  const existing = await findSubscriptionByProviderId(providerSubscriptionId);

  if (existing) {
    await adminDatabases.updateDocument(
      appwriteDatabaseId,
      appwriteSubscriptionsCollectionId,
      existing.$id,
      {
        ...patch,
        last_event_id: event.id,
        last_event_type: event.event_type,
        last_event_at: event.create_time ?? new Date().toISOString(),
      }
    );
    return;
  }

  const planId = resource.plan_id as string | undefined;
  const mappedPlan = planId ? PAYPAL_PLAN_MAP[planId] : undefined;
  const now = new Date().toISOString();
  const isPaidPlan = Boolean(mappedPlan?.internalPlanId);

  await adminDatabases.createDocument(
    appwriteDatabaseId,
    appwriteSubscriptionsCollectionId,
    ID.unique(),
    {
      user_id: resource.custom_id ?? null,
      audience_type: mappedPlan?.audienceType ?? null,
      plan_id: mappedPlan?.internalPlanId ?? null,
      billing_period: mappedPlan?.billingPeriod ?? null,
      status: patch.status ?? "pending",
      price_usd: null,
      trial_start_at: patch.status === "trialing" && isPaidPlan ? now : null,
      trial_end_at:
        patch.status === "trialing" && isPaidPlan ? addDaysISO(now, 30) : null,
      subscription_start_at: patch.subscription_start_at ?? now,
      subscription_end_at: patch.subscription_end_at ?? null,
      payment_provider: "paypal",
      provider_customer_id:
        resource.subscriber?.payer_id ?? resource.payer_id ?? null,
      provider_subscription_id: providerSubscriptionId,
      cancel_at_period_end: patch.cancel_at_period_end ?? false,
      refund_window_days: 7,
      last_event_id: event.id,
      last_event_type: event.event_type,
      last_event_at: event.create_time ?? now,
    }
  );
}

async function handleCreated(event: PayPalWebhookEvent) {
  await createOrUpdateSubscriptionFromWebhook(event, {
    status: "trialing",
    cancel_at_period_end: false,
    subscription_start_at: event.create_time ?? new Date().toISOString(),
  });
}

async function handleActivated(event: PayPalWebhookEvent) {
  await createOrUpdateSubscriptionFromWebhook(event, {
    status: "active",
    cancel_at_period_end: false,
    subscription_start_at: event.create_time ?? new Date().toISOString(),
  });
}

async function handleCancelled(event: PayPalWebhookEvent) {
  await createOrUpdateSubscriptionFromWebhook(event, {
    status: "cancelled",
    cancel_at_period_end: false,
    subscription_end_at: event.create_time ?? new Date().toISOString(),
  });
}

async function handlePaymentFailed(event: PayPalWebhookEvent) {
  await createOrUpdateSubscriptionFromWebhook(event, {
    status: "past_due",
  });
}

async function handleSaleCompleted(event: PayPalWebhookEvent) {
  const adminDatabases = createAdminDatabases();
  const resource = event.resource ?? {};
  const subscriptionId = resource.billing_agreement_id || resource.id;

  if (!subscriptionId) {
    return;
  }

  const existing = await findSubscriptionByProviderId(subscriptionId);
  if (!existing) {
    return;
  }

  await adminDatabases.updateDocument(
    appwriteDatabaseId,
    appwriteSubscriptionsCollectionId,
    existing.$id,
    {
      status: "active",
      last_payment_at: event.create_time ?? new Date().toISOString(),
      last_payment_amount: resource.amount?.total ?? resource.amount?.value ?? null,
      last_payment_currency:
        resource.amount?.currency ?? resource.amount?.currency_code ?? null,
      last_event_id: event.id,
      last_event_type: event.event_type,
      last_event_at: event.create_time ?? new Date().toISOString(),
    }
  );
}

export async function POST(req: Request): Promise<Response> {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody) as PayPalWebhookEvent;

    const verified = await verifyPayPalWebhook({
      headers: req.headers,
      parsedEvent: event,
    });

    if (!verified) {
      return json({ ok: false, error: "Invalid PayPal signature" }, 400);
    }

    if (await alreadyProcessed(event.id)) {
      return json({ ok: true, duplicate: true });
    }

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.CREATED":
        await handleCreated(event);
        break;
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleActivated(event);
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleCancelled(event);
        break;
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await handlePaymentFailed(event);
        break;
      case "PAYMENT.SALE.COMPLETED":
        await handleSaleCompleted(event);
        break;
      default:
        break;
    }

    await markProcessed(event);

    return json({ ok: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}
