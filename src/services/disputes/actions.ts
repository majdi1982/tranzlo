"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { Dispute } from "@/types";
import { revalidatePath } from "next/cache";

export async function openDispute(jobId: string, reason: string) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    // 1. Create Dispute
    const dispute = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.disputesCollectionId,
      ID.unique(),
      {
        jobId,
        openedBy: user.$id,
        reason,
        status: "open",
        createdAt: new Date().toISOString(),
      }
    );

    // 2. Put Job on Hold
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      jobId,
      { status: "cancelled" } // Using cancelled as a proxy for "on_hold" in MVP, or we can add a new status
    );

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true, data: dispute };
  } catch (error: any) {
    return { error: error.message };
  }
}
