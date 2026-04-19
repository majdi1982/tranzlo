import { Client, Databases } from "node-appwrite";
import { appwriteConfig } from "./config";

export const appwriteDatabaseId = appwriteConfig.databaseId;
export const appwriteSubscriptionsCollectionId =
  appwriteConfig.collections.subscriptions;
export const appwritePayPalEventsCollectionId = appwriteConfig.collections.paypalEvents;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function createAdminDatabases() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(requireEnv("APPWRITE_API_KEY"));

  return new Databases(client);
}
