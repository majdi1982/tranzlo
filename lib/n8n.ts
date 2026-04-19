import { getOptionalEnv } from "@/lib/env";

const N8N_WEBHOOK_ENV: Record<string, string> = {
  trial_ending_soon: "N8N_TRIAL_REMINDER_WEBHOOK_URL",
  new_job_posted: "N8N_NEW_JOB_ALERT_WEBHOOK_URL",
  verification_pending_too_long: "N8N_VERIFICATION_ALERT_WEBHOOK_URL",
  ticket_created: "N8N_TICKET_ALERT_WEBHOOK_URL",
  payment_failed: "N8N_BILLING_ALERT_WEBHOOK_URL",
  subscription_cancelled: "N8N_BILLING_ALERT_WEBHOOK_URL",
};

export async function emitN8nEvent(
  event:
    | "trial_ending_soon"
    | "new_job_posted"
    | "verification_pending_too_long"
    | "ticket_created"
    | "payment_failed"
    | "subscription_cancelled",
  payload: Record<string, unknown>
) {
  const url = getOptionalEnv(N8N_WEBHOOK_ENV[event]);
  if (!url) return { ok: false, skipped: true };

  const apiKey = getOptionalEnv("N8N_API_KEY");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ event, payload }),
      cache: "no-store",
    });
    return { ok: response.ok };
  } catch {
    return { ok: false };
  }
}

