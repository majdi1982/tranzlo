'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID, Query } from 'node-appwrite';

const DB_ID = '69da165d00335f7a350e';
const COLLECTION_ID = 'notifications';

export async function getNotifications(userId: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(20)
    ]);
    return response.documents;
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.updateDocument(DB_ID, COLLECTION_ID, notificationId, {
      read: true
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to mark notification as read:', error);
    return { success: false, error: error.message };
  }
}

export async function createNotification(userId: string, title: string, message: string, type = 'info', link = '') {
  try {
    const { databases } = await createAdminClient();
    await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
      userId,
      title,
      message,
      type,
      read: false,
      link
    });
    return { success: true };
  } catch (error) {
    console.error('Internal notification creation failed', error);
    return { success: false };
  }
}
