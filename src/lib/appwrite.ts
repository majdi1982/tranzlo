import { Client, Account, Databases, Storage, Avatars } from 'appwrite';

export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: 'main', // Assuming the database ID is the same as project ID based on common Appwrite setups, or we can update later
  storageId: '6a02e0270002745865a1',  // Standard bucket ID
  collections: {
    jobs: 'jobs',
    translators: 'translators',
    companies: 'companies',
    notifications: 'notifications',
    jobApplications: 'jobApplications',
    auditLogs: 'auditLogs',
    messages: 'messages',
    teamMembers: 'teamMembers',
    teamInvitations: 'teamInvitations',
  }
};

const client = new Client();

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export { ID, Query } from 'appwrite';
export default client;
