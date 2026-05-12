"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";
import { generateTrzId } from "@/lib/redis";

/**
 * NOTIFICATION SERVICE - UNIFIED
 * Adheres to MASTER SYSTEM ARCHITECTURE and DATABASE SCHEMA LAW.
 */

export async function sendNotification(data: {
  userId: string;
  type: "info" | "success" | "warning" | "alert";
  content: string;
  link?: string;
  metadata?: any;
}) {
  const { databases } = await createAdminClient();
  const now = new Date().toISOString();

  try {
    const publicId = await generateTrzId("NTF");

    const notification = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.notificationsCollectionId,
      ID.unique(),
      {
        publicId,
        entityType: "notification",
        userId: data.userId,
        type: data.type,
        content: data.content,
        link: data.link,
        read: false,
        status: "active",
        visibility: "internal",
        createdAt: now,
        updatedAt: now,
        createdBy: "system",
        updatedBy: "system",
        metadata: data.metadata ? JSON.stringify(data.metadata) : JSON.stringify({}),
      }
    );

    return { success: true, data: JSON.parse(JSON.stringify(notification)) };
  } catch (error: any) {
    console.error("Notification Error:", error.message);
    return { error: error.message };
  }
}

export async function getMyNotifications(userId: string) {
  const { databases } = await createAdminClient();
  const { Query } = require("node-appwrite");

  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.notificationsCollectionId,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(20)
      ]
    );
    return { success: true, data: response.documents };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markAsRead(notificationId: string) {
  const { databases } = await createAdminClient();

  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.notificationsCollectionId,
      notificationId,
      { read: true, updatedAt: new Date().toISOString() }
    );
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
