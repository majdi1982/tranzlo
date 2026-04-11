import { Client, Account, Databases, Users, Storage } from "node-appwrite";
import { cookies } from "next/headers";

const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.tranzlo.net/v1').trim();
const projectId = (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '69da16050031d6ff6ddd').trim();
const apiKey = process.env.APPWRITE_API_KEY_SERVER?.trim();

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const session = (await cookies()).get("tranzlo-session");
  
  if (!session || !session.value) {
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
    }
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  if (apiKey) {
    client.setKey(apiKey);
  } else {
    console.warn("⚠️ APPWRITE_API_KEY_SERVER is missing in Server Client initialization.");
  }

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
    }
  };
}

