import { Client, Account, Databases, Storage, Functions, Avatars, ID, Query } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";

let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;
let storage: Storage | null = null;
let functions: Functions | null = null;
let avatars: Avatars | null = null;

export function getAppwriteClient(): Client {
  if (!client) {
    client = new Client().setEndpoint(endpoint).setProject(projectId);
  }
  return client;
}

export function getAccount(): Account {
  if (!account) {
    account = new Account(getAppwriteClient());
  }
  return account;
}

export function getDatabases(): Databases {
  if (!databases) {
    databases = new Databases(getAppwriteClient());
  }
  return databases;
}

export function getStorage(): Storage {
  if (!storage) {
    storage = new Storage(getAppwriteClient());
  }
  return storage;
}

export function getFunctions(): Functions {
  if (!functions) {
    functions = new Functions(getAppwriteClient());
  }
  return functions;
}

export function getAvatars(): Avatars {
  if (!avatars) {
    avatars = new Avatars(getAppwriteClient());
  }
  return avatars;
}

export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";
export const COLLECTIONS = {
  translatorProfiles: "translator_profiles",
  companyProfiles: "company_profiles",
  jobs: "jobs",
  applications: "applications",
  conversations: "conversations",
  messages: "messages",
  notifications: "notifications",
  verificationRequests: "verification_requests",
  blogPosts: "blog_posts",
  hubPosts: "hub_posts",
  complaints: "complaints",
  disputes: "disputes",
  ratings: "ratings",
  plans: "plans",
};

export { ID, Query };
