import { Client, Databases } from "node-appwrite";
import { appwriteConfig } from "./config";

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(appwriteConfig.apiKey);

export const adminDatabases = new Databases(client);
export const appwriteDatabaseId = appwriteConfig.databaseId;
export const appwriteSubscriptionsCollectionId =
  appwriteConfig.collections.subscriptions;
export const appwritePayPalEventsCollectionId = appwriteConfig.collections.paypalEvents;
