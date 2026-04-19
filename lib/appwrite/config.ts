import { getEnv, getOptionalEnv } from "@/lib/env";

export function getAppwriteConfig() {
  return {
    endpoint: getEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT", { optional: true }) || getOptionalEnv("APPWRITE_ENDPOINT"),
    projectId: getEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID", { optional: true }) || getOptionalEnv("APPWRITE_PROJECT_ID"),
    databaseId: getOptionalEnv("APPWRITE_DATABASE_ID"),
    apiKey: getOptionalEnv("APPWRITE_API_KEY"),
    collections: {
      users: getOptionalEnv("APPWRITE_USERS_COLLECTION_ID"),
      subscriptions: getOptionalEnv("APPWRITE_SUBSCRIPTIONS_COLLECTION_ID"),
      jobs: getOptionalEnv("APPWRITE_JOBS_COLLECTION_ID"),
      applications: getOptionalEnv("APPWRITE_APPLICATIONS_COLLECTION_ID"),
      translatorProfiles: getOptionalEnv("APPWRITE_TRANSLATOR_PROFILES_COLLECTION_ID"),
      companyProfiles: getOptionalEnv("APPWRITE_COMPANY_PROFILES_COLLECTION_ID"),
      tickets: getOptionalEnv("APPWRITE_TICKETS_COLLECTION_ID"),
      notifications: getOptionalEnv("APPWRITE_NOTIFICATIONS_COLLECTION_ID"),
      verifications: getOptionalEnv("APPWRITE_VERIFICATIONS_COLLECTION_ID"),
      messages: getOptionalEnv("APPWRITE_MESSAGES_COLLECTION_ID"),
      paypalEvents: getOptionalEnv("APPWRITE_PAYPAL_EVENTS_COLLECTION_ID"),
    },
    buckets: {
      cvs: getOptionalEnv("APPWRITE_STORAGE_BUCKET_CVS_ID"),
      logos: getOptionalEnv("APPWRITE_STORAGE_BUCKET_LOGOS_ID"),
      profileFiles: getOptionalEnv("APPWRITE_STORAGE_BUCKET_PROFILE_FILES_ID"),
      jobAttachments: getOptionalEnv("APPWRITE_STORAGE_BUCKET_JOB_ATTACHMENTS_ID"),
      ticketAttachments: getOptionalEnv("APPWRITE_STORAGE_BUCKET_TICKET_ATTACHMENTS_ID"),
    },
  };
}

