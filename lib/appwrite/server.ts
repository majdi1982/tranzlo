import { Client, Account, Databases, Users, Storage } from "node-appwrite";
import { cookies } from "next/headers";
import { getAppwriteConfig } from "./config";

function buildClient() {
  const config = getAppwriteConfig();
  return new Client().setEndpoint(config.endpoint).setProject(config.projectId);
}

export async function createSessionClient() {
  const client = buildClient();
  const session = (await cookies()).get("session");

  if (!session?.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}

export async function createAdminClient() {
  const config = getAppwriteConfig();
  const client = buildClient().setKey(config.apiKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}

