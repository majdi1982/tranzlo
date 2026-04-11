import { Client, Account, Databases, Users, Storage } from "node-appwrite";
import { cookies } from "next/headers";

let endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.tranzlo.net/v1').trim();
let projectId = (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '69da16050031d6ff6ddd').trim();
let apiKey = process.env.APPWRITE_API_KEY_SERVER?.trim();

// Aggressive validation
if (endpoint === 'undefined' || endpoint === 'null') endpoint = 'https://appwrite.tranzlo.net/v1';
if (projectId === 'undefined' || projectId === 'null') projectId = '69da16050031d6ff6ddd';
if (apiKey === 'undefined' || apiKey === 'null') apiKey = undefined;

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

