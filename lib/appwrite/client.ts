import { Client, Account, Databases, Storage, Avatars } from "appwrite";
import { getAppwriteConfig } from "./config";

const config = getAppwriteConfig();

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

