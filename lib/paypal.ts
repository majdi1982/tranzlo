type PayPalEnv = "sandbox" | "live";

function getPayPalBaseUrl(): string {
  const env = (process.env.PAYPAL_ENV || "sandbox") as PayPalEnv;
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!paypalClientId || !paypalClientSecret) {
    throw new Error("Missing env vars: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  const auth = Buffer.from(
    `${paypalClientId}:${paypalClientSecret}`
  ).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `PayPal OAuth failed: ${response.status} ${await response.text()}`
    );
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function verifyPayPalWebhook(params: {
  headers: Headers;
  parsedEvent: unknown;
}): Promise<boolean> {
  const paypalWebhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!paypalWebhookId) {
    throw new Error("Missing env var: PAYPAL_WEBHOOK_ID");
  }

  const accessToken = await getPayPalAccessToken();
  const transmissionId = params.headers.get("paypal-transmission-id");
  const transmissionTime = params.headers.get("paypal-transmission-time");
  const certUrl = params.headers.get("paypal-cert-url");
  const authAlgo = params.headers.get("paypal-auth-algo");
  const transmissionSig = params.headers.get("paypal-transmission-sig");

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    return false;
  }

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: paypalWebhookId,
        webhook_event: params.parsedEvent,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `PayPal verify failed: ${response.status} ${await response.text()}`
    );
  }

  const data = (await response.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}
