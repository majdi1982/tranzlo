import { Client, Account, Databases, Storage } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  console.warn('⚠️ Appwrite Environment Variables are missing! Check your .env.local file.');
}

const client = new Client()
  .setEndpoint(endpoint || 'https://appwrite.tranzlo.net/v1')
  .setProject(projectId || '69da16050031d6ff6ddd');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
