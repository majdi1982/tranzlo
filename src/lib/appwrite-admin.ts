import { Client, Databases, Storage, Users } from "node-appwrite";
import { appwriteConfig } from "./appwrite-config";

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.apiKey);

  return {
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}
