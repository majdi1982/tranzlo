'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID, Query } from 'node-appwrite';

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'notifications';

export interface Notification {
  $id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'job' | 'payment' | 'message';
  isRead: boolean;
  link?: string;
  $createdAt: string;
}

/**
 * Fetches the most recent notifications for the logged-in user.
 */
export async function getNotifications(limit = 10) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('userId', user.$id),
      Query.orderDesc('$createdAt'),
      Query.limit(limit)
    ]);

    return { notifications: response.documents as unknown as Notification[] };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { notifications: [], error: 'Failed to fetch notifications' };
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markAsRead(notificationId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.updateDocument(DB_ID, COLLECTION_ID, notificationId, {
      isRead: true
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false };
  }
}

/**
 * Internal helper to create a notification (Server-side only).
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  link?: string;
}) {
  try {
    const { databases } = await createAdminClient();
    await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
      ...data,
      isRead: false
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { success: false };
  }
}
