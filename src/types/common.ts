export type Role = "translator" | "company" | "admin" | "staff";

export type EntityStatus = "active" | "inactive" | "suspended";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type ApplicationStatus =
  | "submitted"
  | "viewed"
  | "shortlisted"
  | "test_invited"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type JobStatus = "open" | "closed" | "filled" | "cancelled";

export type DisputeStatus = "open" | "pending" | "resolved" | "rejected";

export type ComplaintStatus = "open" | "resolved" | "rejected";

export type BlogPostStatus = "draft" | "scheduled" | "pending_review" | "published" | "rejected";

export type HubPostStatus = "draft" | "pending_review" | "published" | "rejected" | "hidden";

export type NotificationType =
  | "email_verification_reminder"
  | "verification_approved"
  | "verification_rejected"
  | "job_match"
  | "application_update"
  | "message_received"
  | "complaint_update"
  | "dispute_update"
  | "hub_post_approved"
  | "hub_post_rejected"
  | "blog_post_approved"
  | "blog_post_rejected"
  | "trial_ending"
  | "upgrade_required"
  | "invitation"
  | "test_distributed"
  | "test_reminder"
  | "test_expired"
  | "translator_selected"
  | "job_closed_max_applicants";

export type PlanTier = "free" | "starter" | "professional" | "enterprise";

export type TrialStatus = "active" | "expired" | "converted";

export type FileType = "image" | "pdf" | "document";

export type StaffRole = "support" | "moderator" | "verification_officer";
