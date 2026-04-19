import { Client, Databases } from "node-appwrite";
import { getAppwriteConfig } from "./config";

export const appwriteDatabaseId = () => getAppwriteConfig().databaseId;
export const appwriteSubscriptionsCollectionId = () => getAppwriteConfig().collections.subscriptions;
export const appwritePayPalEventsCollectionId = () => getAppwriteConfig().collections.paypalEvents;

export function createAdminDatabases() {
  const config = getAppwriteConfig();
  if (!config.endpoint || !config.projectId || !config.apiKey) {
    throw new Error("Missing required Appwrite server env vars.");
  }

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

  return new Databases(client);
}

