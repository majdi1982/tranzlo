"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { UserProfile } from "@/types";

export async function getTranslators(queries: string[] = []) {
  const { databases } = await createAdminClient();

  try {
    const translators = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      [Query.equal("role", "translator"), ...queries]
    );
    return { success: true, data: translators.documents as unknown as UserProfile[] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getProfileById(userId: string) {
  const { databases } = await createAdminClient();

  try {
    const profile = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId
    );
    return { success: true, data: profile as unknown as UserProfile };
  } catch (error: any) {
    return { error: error.message };
  }
}
