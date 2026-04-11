'use server';

import { createAdminClient, createSessionClient } from '@/lib/server/appwrite';

const DB_ID = '69da165d00335f7a350e';

// Verify that the current session user has admin privileges
export async function getAdminUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    // Admins are identified by a custom label set in Appwrite
    const isAdmin = user.labels?.includes('admin');

    if (!isAdmin) {
      throw new Error('UNAUTHORIZED: Admin access required');
    }

    return user;
  } catch (error) {
    throw new Error('UNAUTHORIZED: Admin session invalid');
  }
}

// List all platform users (admin-only)
export async function listAllUsers(limit = 25, offset = 0) {
  try {
    await getAdminUser(); // Guard
    const { users } = await createAdminClient();
    return users.list([], `limit=${limit}&offset=${offset}`);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Grant admin label to a user
export async function makeUserAdmin(userId: string) {
  try {
    await getAdminUser();
    const { users } = await createAdminClient();
    return await users.updateLabels(userId, ['admin']);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Ban a user from the platform
export async function banUser(userId: string) {
  try {
    await getAdminUser();
    const { users } = await createAdminClient();
    return await users.updateStatus(userId, false);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Unban a user
export async function unbanUser(userId: string) {
  try {
    await getAdminUser();
    const { users } = await createAdminClient();
    return await users.updateStatus(userId, true);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Verify a translator
export async function verifyTranslator(userId: string) {
  try {
    await getAdminUser();
    const { users } = await createAdminClient();
    const user = await users.get(userId);
    const updatedLabels = Array.from(new Set([...(user.labels || []), 'verified']));
    return await users.updateLabels(userId, updatedLabels);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Delete a Job post (moderation)
export async function deleteJob(jobId: string) {
  try {
    await getAdminUser();
    const { databases } = await createAdminClient();
    await databases.deleteDocument(DB_ID, 'jobs', jobId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
