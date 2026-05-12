"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query, Permission, Role } from "node-appwrite";
import { Notification } from "@/types";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const notifications = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.notificationsCollectionId,
      [Query.equal("userId", user.$id), Query.orderDesc("createdAt"), Query.limit(20)]
    );
    return { success: true, data: notifications.documents as unknown as Notification[] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const { databases } = await createSessionClient();

  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.notificationsCollectionId,
      notificationId,
      { read: true }
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createNotification(userId: string, type: string, content: string, link?: string) {
  const { databases } = await createAdminClient();

  try {
    const notification = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.notificationsCollectionId,
      ID.unique(),
      {
        userId,
        type,
        content,
        link,
        read: false,
        createdAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return { success: true, data: notification };
  } catch (error: any) {
    return { error: error.message };
  }
}
