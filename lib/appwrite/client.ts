import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const client = new Client()
  .setEndpoint("https://appwrite.tranzlo.net/v1")
  .setProject("PROJECT_ID");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
