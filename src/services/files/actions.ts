"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { FileMetadata } from "@/types";
import { revalidatePath } from "next/cache";

export async function uploadFileMetadata(jobId: string, fileId: string, fileName: string, version: number = 1) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const metadata = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.filesCollectionId,
      ID.unique(),
      {
        jobId,
        uploaderId: user.$id,
        fileId, // Refers to ID in Appwrite Storage
        fileName,
        version,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true, data: metadata };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getJobFiles(jobId: string) {
  const { databases } = await createAdminClient();

  try {
    const files = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.filesCollectionId,
      [Query.equal("jobId", jobId), Query.orderDesc("createdAt")]
    );

    return { success: true, data: files.documents as unknown as FileMetadata[] };
  } catch (error: any) {
    return { error: error.message };
  }
}
