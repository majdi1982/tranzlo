"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { Job, UserProfile } from "@/types";

/**
 * MATCHING ENGINE - SMART DISCOVERY
 * Matches jobs with translators based on language pairs and skills.
 */

export async function findMatchingTranslators(jobId: string) {
  const { databases } = await createAdminClient();

  try {
    // 1. Get job details
    const job = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId
    ) as unknown as Job;

    // 2. Query translators who support the target language
    // Note: This is a basic match. Future versions will include skill matching.
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.translatorsCollectionId,
      [
        Query.contains("languages", job.targetLanguage),
        Query.limit(50)
      ]
    );

    return { success: true, data: response.documents };
  } catch (error: any) {
    console.error("Matching Error:", error.message);
    return { error: error.message };
  }
}

export async function suggestJobsForTranslator(translatorId: string) {
  const { databases } = await createAdminClient();

  try {
    // 1. Get translator profile
    const translator = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.translatorsCollectionId,
      translatorId
    );

    const languages = translator.languages || [];

    // 2. Find active jobs where targetLanguage is in translator's languages
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      [
        Query.equal("status", "active"),
        Query.equal("isInviteOnly", false),
        Query.contains("targetLanguage", languages),
        Query.orderDesc("createdAt"),
        Query.limit(10)
      ]
    );

    return { success: true, data: response.documents as unknown as Job[] };
  } catch (error: any) {
    return { error: error.message };
  }
}
