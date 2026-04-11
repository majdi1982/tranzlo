/**
 * Fatora.io Payment Gateway Integration
 * Base URL: https://api.fatora.io/v1
 * Auth: api_key header
 */

const FATORA_BASE = 'https://api.fatora.io/v1';
const FATORA_API_KEY = process.env.FATORA_API_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface FatoraCheckoutPayload {
  amount: number;
  currency: 'USD' | 'QAR' | 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR';
  order_id: string;
  description?: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  success_url: string;
  failure_url: string;
  lang?: 'en' | 'ar';
}

export interface FatoraCheckoutResponse {
  result: string;         // 'Payment session created successfully' 
  url: string;            // Hosted checkout URL to redirect the user to
  payment_id?: string;    // Internal Fatora payment ID
  [key: string]: unknown;
}

export interface FatoraVerifyResponse {
  result: string;
  payment_status: 'CAPTURED' | 'FAILED' | 'PENDING' | string;
  amount?: number;
  currency?: string;
  order_id?: string;
  [key: string]: unknown;
}

async function fatoraRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: unknown
): Promise<T> {
  const res = await fetch(`${FATORA_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'api_key': FATORA_API_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fatora API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Create a hosted checkout session.
 * Returns the payment URL to redirect the user to.
 */
export async function createCheckoutSession(
  payload: FatoraCheckoutPayload
): Promise<FatoraCheckoutResponse> {
  return fatoraRequest<FatoraCheckoutResponse>('/payments/checkout', 'POST', payload);
}

/**
 * Verify payment status by order_id (after redirect back from Fatora).
 */
export async function verifyPayment(orderId: string): Promise<FatoraVerifyResponse> {
  return fatoraRequest<FatoraVerifyResponse>(
    `/payments/checkout/verify?order_id=${encodeURIComponent(orderId)}`,
    'GET'
  );
}

/**
 * Build a standard Tranzlo checkout session for Pro subscriptions.
 */
export async function createSubscriptionCheckout(opts: {
  orderId: string;
  plan: 'translator_pro' | 'company_pro';
  userEmail: string;
  userName: string;
  userPhone?: string;
}): Promise<string> {
  const prices: Record<string, number> = {
    translator_pro: 12,
    company_pro: 49,
  };

  const amount = prices[opts.plan];
  const appUrl = APP_URL;

  const session = await createCheckoutSession({
    amount,
    currency: 'USD',
    order_id: opts.orderId,
    description: `Tranzlo ${opts.plan === 'translator_pro' ? 'Translator Pro' : 'Company Pro'} Subscription`,
    client: {
      name: opts.userName,
      email: opts.userEmail,
      phone: opts.userPhone,
    },
    success_url: `${appUrl}/payment/success?order_id=${opts.orderId}`,
    failure_url: `${appUrl}/payment/failure?order_id=${opts.orderId}`,
    lang: 'en',
  });

  return session.url;
}
