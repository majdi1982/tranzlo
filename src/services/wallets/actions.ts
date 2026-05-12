"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { generateTrzId } from "@/lib/redis";

/**
 * WALLET SERVICE - FINANCIAL BACKEND
 * Adheres to MASTER SYSTEM ARCHITECTURE and DATABASE SCHEMA LAW.
 */

export async function createWallet(userId: string) {
  const { databases } = await createAdminClient();
  const now = new Date().toISOString();

  try {
    const publicId = await generateTrzId("WLT");

    const wallet = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.walletsCollectionId,
      ID.unique(),
      {
        publicId,
        entityType: "wallet",
        userId,
        balance: 0.0,
        currency: "USD",
        status: "active",
        visibility: "internal",
        createdAt: now,
        updatedAt: now,
        createdBy: "system",
        updatedBy: "system",
        metadata: JSON.stringify({}),
      }
    );

    return { success: true, data: JSON.parse(JSON.stringify(wallet)) };
  } catch (error: any) {
    console.error("Wallet Creation Error:", error.message);
    return { error: error.message };
  }
}

export async function getWalletBalance(userId: string) {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.walletsCollectionId,
      [Query.equal("userId", userId)]
    );

    if (response.documents.length === 0) {
      // Auto-create wallet if missing
      return await createWallet(userId);
    }

    return { success: true, data: response.documents[0] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addTransaction(data: {
  walletId: string;
  amount: number;
  type: "credit" | "debit";
  referenceId?: string;
}) {
  const { databases } = await createAdminClient();
  const now = new Date().toISOString();

  try {
    const publicId = await generateTrzId("TXN");

    // 1. Create Transaction Record
    const transaction = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.transactionsCollectionId,
      ID.unique(),
      {
        publicId,
        entityType: "transaction",
        walletId: data.walletId,
        amount: data.amount,
        type: data.type,
        referenceId: data.referenceId,
        status: "completed",
        visibility: "internal",
        createdAt: now,
        updatedAt: now,
        createdBy: "system",
        updatedBy: "system",
        metadata: JSON.stringify({}),
      }
    );

    // 2. Update Wallet Balance
    const wallet = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.walletsCollectionId,
      data.walletId
    );

    const newBalance = data.type === "credit" 
      ? wallet.balance + data.amount 
      : wallet.balance - data.amount;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.walletsCollectionId,
      data.walletId,
      { balance: newBalance, updatedAt: now }
    );

    return { success: true, transaction };
  } catch (error: any) {
    return { error: error.message };
  }
}
