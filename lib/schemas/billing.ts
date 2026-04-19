export const BILLING_CYCLES = ["monthly", "yearly"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const PLAN_AUDIENCES = ["translator", "company"] as const;
export type PlanAudience = (typeof PLAN_AUDIENCES)[number];

