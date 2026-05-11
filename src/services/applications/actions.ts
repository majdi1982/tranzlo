"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { Application, ApplicationStatus } from "@/types";
import { revalidatePath } from "next/cache";

export async function submitProposal(formData: any) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const application = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bidsCollectionId, // Using bids as applications
      ID.unique(),
      {
        jobId: formData.jobId,
        translatorId: user.$id,
        proposalText: formData.proposalText,
        price: formData.price,
        deliveryTime: formData.deliveryTime,
        status: "applied",
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath(`/dashboard/projects/${formData.jobId}`);
    return { success: true, data: application };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getApplicationsForJob(jobId: string) {
  const { databases } = await createAdminClient();

  try {
    const apps = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bidsCollectionId,
      [Query.equal("jobId", jobId), Query.orderDesc("createdAt")]
    );
    return { success: true, data: apps.documents as unknown as Application[] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateApplicationStatus(appId: string, status: ApplicationStatus) {
  const { databases } = await createSessionClient();

  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bidsCollectionId,
      appId,
      { status }
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function hireTranslator(jobId: string, translatorId: string, appId: string) {
  const { databases, account } = await createSessionClient();

  try {
    // 1. Update Application status to hired
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bidsCollectionId,
      appId,
      { status: "hired" }
    );

    // 2. Update Job status to in_progress and assign translator
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      jobId,
      { 
        status: "in_progress",
        hiredTranslatorId: translatorId 
      }
    );

    // 3. Create Chat Room for collaboration
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.chatRoomsCollectionId,
      ID.unique(),
      {
        jobId,
        participants: [translatorId, (await account.get()).$id],
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
