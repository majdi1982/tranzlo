import { Client, Databases } from "node-appwrite";
import { appwriteConfig } from "./config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(requireEnv("APPWRITE_API_KEY"));

export const adminDatabases = new Databases(client);
export const appwriteDatabaseId = appwriteConfig.databaseId;
export const appwriteSubscriptionsCollectionId =
  appwriteConfig.collections.subscriptions;
export const appwritePayPalEventsCollectionId =
  requireEnv("NEXT_PUBLIC_APPWRITE_PAYPAL_EVENTS_COLLECTION_ID");
