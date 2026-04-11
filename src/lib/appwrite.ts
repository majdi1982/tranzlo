import { Client, Account, Databases, Storage } from 'appwrite';

let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
let projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim();

// Aggressive validation: Treat "undefined" strings as missing
if (endpoint === 'undefined' || endpoint === 'null') endpoint = undefined;
if (projectId === 'undefined' || projectId === 'null') projectId = undefined;

if (!endpoint || !projectId) {
  console.warn('⚠️ Appwrite Environment Variables are missing or invalid! Using verified fallbacks.');
}

const client = new Client()
  .setEndpoint(endpoint || 'https://appwrite.tranzlo.net/v1')
  .setProject(projectId || '69da16050031d6ff6ddd');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
