export const USER_ROLES = ["translator", "company", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "pending",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const TICKET_STATUSES = [
  "open",
  "pending_user",
  "pending_staff",
  "escalated",
  "resolved",
  "closed",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "reviewing",
  "shortlisted",
  "rejected",
  "accepted",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

