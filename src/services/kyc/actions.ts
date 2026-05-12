"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { KYCData } from "@/types";
import { revalidatePath } from "next/cache";

export async function submitKYC(documentType: string, fileId: string) {
  const { databases, account, storage } = await createSessionClient();
  const user = await account.get();

  try {
    const documentUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;

    const kyc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.kycCollectionId,
      ID.unique(),
      {
        userId: user.$id,
        documentType,
        documentUrl,
        status: "pending",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    revalidatePath("/dashboard/settings");
    return { success: true, data: kyc };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getKYCStatus() {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const kycDocs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.kycCollectionId,
      [Query.equal("userId", user.$id), Query.orderDesc("submittedAt"), Query.limit(1)]
    );
    return { success: true, data: kycDocs.documents[0] as unknown as KYCData };
  } catch (error: any) {
    return { error: error.message };
  }
}
