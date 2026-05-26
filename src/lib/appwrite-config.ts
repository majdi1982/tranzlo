const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const apiKey = process.env.APPWRITE_API_KEY || "";

export const appwriteConfig = {
  endpoint,
  projectId,
  apiKey,
  get isConfigured() {
    return !!(this.endpoint && this.projectId);
  },
};
