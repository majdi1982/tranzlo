"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { Invitation } from "@/types";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/services/notifications/actions";

export async function sendInvitation(jobId: string, translatorId: string, message?: string) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const invitation = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.invitationsCollectionId,
      ID.unique(),
      {
        jobId,
        companyId: user.$id,
        translatorId,
        message,
        status: "pending",
        createdAt: new Date().toISOString(),
      }
    );

    // Notify translator
    await createNotification(
      translatorId,
      "invitation",
      `You have been invited to a new project.`,
      `/dashboard/jobs/${jobId}`
    );

    return { success: true, data: invitation };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function respondToInvitation(invitationId: string, status: "accepted" | "declined") {
  const { databases } = await createSessionClient();

  try {
    const invitation = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.invitationsCollectionId,
      invitationId
    );

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.invitationsCollectionId,
      invitationId,
      { status }
    );

    // Notify company
    await createNotification(
      invitation.companyId,
      "invitation",
      `A translator has ${status} your invitation.`,
      `/dashboard/projects/${invitation.jobId}`
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
