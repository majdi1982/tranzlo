'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'profiles';

export interface Profile {
  $id: string;
  userId: string;
  bio: string;
  nativeLanguage: string;
  sourceLanguages: string[];
  targetLanguages: string[];
  specialties: string[];
  rating: number;
  totalJobs: number;
  cvFileId?: string;
}

/**
 * Gets the profile for a specific user.
 */
export async function getProfile(userId: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('userId', userId),
      Query.limit(1)
    ]);

    return response.documents[0] as unknown as Profile || null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

/**
 * Updates or creates the profile for the currently logged-in user.
 */
export async function updateProfile(data: Partial<Omit<Profile, '$id' | 'userId' | 'rating' | 'totalJobs'>>) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    // Check if profile exists
    const existing = await getProfile(user.$id);

    if (existing) {
      await databases.updateDocument(DB_ID, COLLECTION_ID, existing.$id, data);
    } else {
      await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
        ...data,
        userId: user.$id,
        rating: 0,
        totalJobs: 0
      });
    }

    revalidatePath(`/translators/${user.$id}`);
    revalidatePath('/dashboard/translator/profile');
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to save profile changes' };
  }
}

/**
 * Fetches multiple profiles (e.g., for a directory).
 */
export async function listProfiles(limit = 20) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.limit(limit),
      Query.orderDesc('rating')
    ]);

    return response.documents as unknown as Profile[];
  } catch (error) {
    console.error('Failed to list profiles:', error);
    return [];
  }
}
