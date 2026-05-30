const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const apiKey = process.env.APPWRITE_API_KEY || "";

export const appwriteConfig = {
  endpoint,
  projectId,
  apiKey,
  get isConfigured() {
    return !!(this.endpoint && this.projectId);
  },
};
