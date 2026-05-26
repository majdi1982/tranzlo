export const COLLECTIONS = {
  TRANSLATOR_PROFILES: "translator_profiles",
  COMPANY_PROFILES: "company_profiles",
  VERIFICATION_REQUESTS: "verification_requests",
  VERIFICATION_DOCUMENTS: "verification_documents",
  JOBS: "jobs",
  APPLICATIONS: "applications",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
  COMPLAINTS: "complaints",
  DISPUTES: "disputes",
  BLOG_POSTS: "blog_posts",
  HUB_POSTS: "hub_posts",
  HUB_COMMENTS: "hub_comments",
  RATINGS: "ratings",
  PLANS: "plans",
  SUBSCRIPTIONS: "subscriptions",
  AUDIT_LOGS: "audit_logs",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
