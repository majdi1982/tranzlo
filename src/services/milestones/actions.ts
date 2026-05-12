"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { generateTrzId } from "@/lib/redis";
import { addTransaction, getWalletBalance } from "@/services/wallets/actions";
import { sendNotification } from "@/services/notifications/actions";

/**
 * MILESTONE SERVICE - PROJECT MANAGEMENT
 * Adheres to MASTER SYSTEM ARCHITECTURE and DATABASE SCHEMA LAW.
 */

export async function createMilestones(jobId: string, milestones: { title: string, amount: number, deadline?: string }[]) {
  const { databases } = await createAdminClient();
  const now = new Date().toISOString();

  try {
    const results = [];
    for (const m of milestones) {
      const publicId = await generateTrzId("MLS");
      const milestone = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.milestonesCollectionId,
        ID.unique(),
        {
          publicId,
          entityType: "milestone",
          jobId,
          title: m.title,
          amount: m.amount,
          deadline: m.deadline,
          status: "pending",
          visibility: "internal",
          createdAt: now,
          updatedAt: now,
          createdBy: "system",
          updatedBy: "system",
          metadata: JSON.stringify({}),
        }
      );
      results.push(milestone);
    }
    return { success: true, data: results };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function releaseMilestone(milestoneId: string, translatorId: string) {
  const { databases } = await createAdminClient();
  const now = new Date().toISOString();

  try {
    // 1. Get Milestone details
    const milestone = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.milestonesCollectionId,
      milestoneId
    );

    if (milestone.status === "completed") {
      throw new Error("Milestone already released");
    }

    // 2. Get Translator's Wallet
    const walletRes = await getWalletBalance(translatorId);
    if (!walletRes.success) throw new Error("Wallet not found");

    // 3. Add Transaction (Credit Translator)
    await addTransaction({
      walletId: walletRes.data.$id,
      amount: milestone.amount,
      type: "credit",
      referenceId: milestoneId
    });

    // 4. Update Milestone Status
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.milestonesCollectionId,
      milestoneId,
      { status: "completed", updatedAt: now }
    );

    // 5. Notify Translator
    await sendNotification({
      userId: translatorId,
      type: "success",
      content: `Payment released! $${milestone.amount} has been added to your wallet for milestone: ${milestone.title}`,
      link: "/dashboard/wallet"
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
