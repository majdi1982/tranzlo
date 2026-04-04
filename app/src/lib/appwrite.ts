import { Client, Account, Databases, Storage } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69cd26bd000709d10282";

export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper constants for your Database setup
export const DATABASE_ID = "main_db"; // To be updated during schema setup
export const USERS_COLLECTION_ID = "users"; // Store role/trial info here
export const JOBS_COLLECTION_ID = "jobs";
