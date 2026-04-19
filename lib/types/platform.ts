import type { ApplicationStatus, SubscriptionStatus, TicketStatus, UserRole } from "@/lib/constants/roles";

export type PlatformRole = UserRole | null;

export type SubscriptionRecord = {
  planId: string | null;
  audienceType: "translator" | "company" | null;
  status: SubscriptionStatus;
  billingPeriod: "monthly" | "yearly" | "custom" | null;
  providerSubscriptionId: string | null;
};

export type TicketRecord = {
  status: TicketStatus;
  category: string;
};

export type ApplicationRecord = {
  status: ApplicationStatus;
};

