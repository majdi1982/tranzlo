'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DB_ID = '69da165d00335f7a350e';

export interface Profile {
  $id: string;
  userId: string;
  fullName: string;
  bio?: string;
  nativeLanguage?: string;
  languages?: string[];
  skills?: string[];
  rating?: number;
  avatarUrl?: string;
  title?: string;
  [key: string]: any;
}

/**
 * Gets the profile for a specific user.
 */
export async function getProfile(userId: string) {
  try {
    const { databases, users } = await createAdminClient();
    
    // Determine role by labels
    const userRole = await users.get(userId);
    const collectionId = userRole.labels.includes('company') ? 'companies' : 'translators';
    
    const response = await databases.listDocuments(DB_ID, collectionId, [
      Query.equal('userId', userId),
      Query.limit(1)
    ]);

    return response.documents[0] || null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

/**
 * Updates the specialized profile for the currently logged-in user.
 */
export async function updateProfile(data: any) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    
    // Strategy: Switch collection based on user labels
    const collectionId = user.labels.includes('company') ? 'companies' : 'translators';

    // Document ID matches User ID for 1:1 profiles in V4
    try {
      await databases.updateDocument(DB_ID, collectionId, user.$id, data);
    } catch (e: any) {
      if (e.code === 404) {
        // Fallback: Create if missing
        await databases.createDocument(DB_ID, collectionId, user.$id, {
          ...data,
          userId: user.$id
        });
      } else throw e;
    }

    revalidatePath(`/translators/${user.$id}`);
    revalidatePath(`/dashboard/${user.labels.includes('company') ? 'company' : 'translator'}/profile`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return { success: false, error: error.message || 'Failed to save profile changes' };
  }
}

/**
 * Fetches multiple translator profiles for the directory.
 */
export async function listTranslators(limit = 20) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, 'translators', [
      Query.limit(limit),
      Query.orderDesc('rating')
    ]);

    return response.documents;
  } catch (error) {
    console.error('Failed to list translators:', error);
    return [];
  }
}
