export const BUCKETS = {
  PROFILE_IMAGES: "profile_images",
  TRANSLATOR_DOCUMENTS: "translator_documents",
  COMPANY_DOCUMENTS: "company_documents",
  CERTIFICATES: "certificates",
  BLOG_MEDIA: "blog_media",
  HUB_MEDIA: "hub_media",
  COMPLAINT_ATTACHMENTS: "complaint_attachments",
  DISPUTE_ATTACHMENTS: "dispute_attachments",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];
