export type InvoiceStatus = "draft" | "issued" | "paid";
export type LedgerEntryType = "escrow_fund" | "escrow_release" | "commission" | "payout";
export type InvoiceType = "company_funding" | "translator_payout" | "admin_commission";

export interface LedgerEntry {
  $id: string;
  transactionId: string;
  code: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "subscription" | "job_escrow";
  planTier: string;
  amount: number;
  feeDeducted: number;
  status: "funded" | "approved" | "released" | "refunded" | "failed";
  transferStatus?: string;
  responseLog?: string;
  createdAt: string;
}

export interface Invoice {
  $id: string;
  jobId: string;
  userId: string;
  type: InvoiceType;
  planTier: string;
  jobBaseValue: number;
  feeAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paypalTransactionId?: string;
  createdAt: string;
}

/**
 * Commission rates per plan tier.
 * 3 plans: free (Plan 1), pro (Plan 2), plus (Plan 3).
 *
 * Company pays: 10% / 5% / 0%
 * Translator pays: 20% / 15% / 5%
 */
export const COMMISSION_RATES = {
  company: {
    free: 0.10,
    pro: 0.05,
    plus: 0.00,
  },
  translator: {
    free: 0.20,
    pro: 0.15,
    plus: 0.05,
  },
} as const;

export function getCompanyCommissionRate(planTier: string): number {
  if (planTier === "pro") return COMMISSION_RATES.company.pro;
  if (planTier === "plus") return COMMISSION_RATES.company.plus;
  return COMMISSION_RATES.company.free;
}

export function getTranslatorCommissionRate(planTier: string): number {
  if (planTier === "pro") return COMMISSION_RATES.translator.pro;
  if (planTier === "plus") return COMMISSION_RATES.translator.plus;
  return COMMISSION_RATES.translator.free;
}
