export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  apiKey: process.env.APPWRITE_API_KEY!, // Server-side only
  collections: {
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    subscriptions: process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID!,
    jobs: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
    applications: process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,

    plans: process.env.NEXT_PUBLIC_APPWRITE_PLANS_COLLECTION_ID!,
    planFeatures: process.env.NEXT_PUBLIC_APPWRITE_PLAN_FEATURES_COLLECTION_ID!,
    planFeatureValues: process.env.NEXT_PUBLIC_APPWRITE_PLAN_FEATURE_VALUES_COLLECTION_ID!,
    trialRules: process.env.NEXT_PUBLIC_APPWRITE_TRIAL_RULES_COLLECTION_ID!,
    paypalPlanMapping: process.env.NEXT_PUBLIC_APPWRITE_PAYPAL_PLAN_MAPPING_COLLECTION_ID!,
    paypalEvents: process.env.NEXT_PUBLIC_APPWRITE_PAYPAL_EVENTS_COLLECTION_ID!,
    uiVisibilityRules: process.env.NEXT_PUBLIC_APPWRITE_UI_VISIBILITY_RULES_COLLECTION_ID!,
  }
};
