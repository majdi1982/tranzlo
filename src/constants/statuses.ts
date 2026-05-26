export const VERIFICATION_STATUSES = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export const APPLICATION_STATUSES = {
  SUBMITTED: "submitted",
  VIEWED: "viewed",
  SHORTLISTED: "shortlisted",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export const JOB_STATUSES = {
  OPEN: "open",
  CLOSED: "closed",
  FILLED: "filled",
  CANCELLED: "cancelled",
} as const;

export const DISPUTE_STATUSES = {
  OPEN: "open",
  PENDING: "pending",
  RESOLVED: "resolved",
  REJECTED: "rejected",
} as const;

export const COMPLAINT_STATUSES = {
  OPEN: "open",
  RESOLVED: "resolved",
  REJECTED: "rejected",
} as const;

export const BLOG_STATUSES = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  PENDING_REVIEW: "pending_review",
  PUBLISHED: "published",
  REJECTED: "rejected",
} as const;

export const HUB_STATUSES = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  PUBLISHED: "published",
  REJECTED: "rejected",
  HIDDEN: "hidden",
} as const;
