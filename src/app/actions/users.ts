'use server';

import { createAdminClient } from '@/lib/server/appwrite';

export async function getUserById(userId: string) {
  try {
    const { users } = await createAdminClient();
    const user = await users.get(userId);
    return {
      name: user.name,
      email: user.email,
      id: user.$id,
      labels: user.labels,
      prefs: user.prefs,
    };
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    return null;
  }
}
