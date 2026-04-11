'use server';

import { createAdminClient } from '@/lib/server/appwrite';
import { createSessionClient } from '@/lib/server/appwrite';

// Verify that the current session user has admin privileges
export async function getAdminUser() {
  const { account } = await createSessionClient();
  const user = await account.get();

  // Admins are identified by a custom label set in Appwrite
  const isAdmin = user.labels?.includes('admin');

  if (!isAdmin) {
    throw new Error('UNAUTHORIZED: Admin access required');
  }

  return user;
}

// List all platform users (admin-only)
export async function listAllUsers(limit = 25, offset = 0) {
  await getAdminUser(); // Guard
  const { users } = await createAdminClient();
  return users.list([], `search=${''}&limit=${limit}&offset=${offset}`);
}

// Grant admin label to a user
export async function makeUserAdmin(userId: string) {
  await getAdminUser();
  const { users } = await createAdminClient();
  return users.updateLabels(userId, ['admin']);
}

// Ban a user from the platform
export async function banUser(userId: string) {
  await getAdminUser();
  const { users } = await createAdminClient();
  return users.updateStatus(userId, false);
}

// Unban a user
export async function unbanUser(userId: string) {
  await getAdminUser();
  const { users } = await createAdminClient();
  return users.updateStatus(userId, true);
}

// Verify a translator (sets a 'verified_translator' label)
export async function verifyTranslator(userId: string) {
  await getAdminUser();
  const { users } = await createAdminClient();
  const user = await users.get(userId);
  const updatedLabels = Array.from(new Set([...(user.labels || []), 'verified_translator']));
  return users.updateLabels(userId, updatedLabels);
}

// Remove translator verification
export async function revokeTranslatorVerification(userId: string) {
  await getAdminUser();
  const { users } = await createAdminClient();
  const user = await users.get(userId);
  const updatedLabels = (user.labels || []).filter((l: string) => l !== 'verified_translator');
  return users.updateLabels(userId, updatedLabels);
}

// Delete a Job post (moderation)
export async function deleteJob(jobId: string) {
  await getAdminUser();
  const { databases } = await createAdminClient();
  return databases.deleteDocument(
    process.env.APPWRITE_DATABASE_ID!,
    'jobs',
    jobId
  );
}
