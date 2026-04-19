export const PAYPAL_PLAN_MAP: Record<
  string,
  {
    internalPlanId: string;
    audienceType: "translator" | "company";
    billingPeriod: "monthly" | "yearly" | "custom";
  }
> = {
  REPLACE_PAYPAL_TRANSLATOR_PRO_MONTHLY: {
    internalPlanId: "translator_pro_monthly",
    audienceType: "translator",
    billingPeriod: "monthly",
  },
  REPLACE_PAYPAL_TRANSLATOR_PRO_YEARLY: {
    internalPlanId: "translator_pro_yearly",
    audienceType: "translator",
    billingPeriod: "yearly",
  },
  REPLACE_PAYPAL_TRANSLATOR_PREMIUM_MONTHLY: {
    internalPlanId: "translator_premium_monthly",
    audienceType: "translator",
    billingPeriod: "monthly",
  },
  REPLACE_PAYPAL_COMPANY_BASIC_MONTHLY: {
    internalPlanId: "company_basic_monthly",
    audienceType: "company",
    billingPeriod: "monthly",
  },
  REPLACE_PAYPAL_COMPANY_PRO_MONTHLY: {
    internalPlanId: "company_pro_monthly",
    audienceType: "company",
    billingPeriod: "monthly",
  },
  REPLACE_PAYPAL_COMPANY_PRO_YEARLY: {
    internalPlanId: "company_pro_yearly",
    audienceType: "company",
    billingPeriod: "yearly",
  },
};
