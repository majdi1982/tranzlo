import { databases, APPWRITE_CONFIG } from '../appwrite';
import { generateTrzId } from '../utils/ids';
import { ID, Query } from 'appwrite';

export interface NotificationData {
  title: string;
  message: string;
  type: 'system' | 'message' | 'payment' | 'broadcast' | 'dispute';
  userId: string;
}

export const NotificationService = {
  /**
   * Create a new notification document (complies with DATABASE_SCHEMA_LAW)
   */
  async createNotification(data: NotificationData) {
    const publicId = generateTrzId('APP'); // Standardized application entities
    const now = new Date().toISOString();

    const notificationDoc = {
      publicId,
      entityType: 'notification',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      status: 'active',
      visibility: 'private',
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      userId: data.userId,
    };

    try {
      return await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        ID.unique(),
        notificationDoc
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  },

  /**
   * Fetch active notifications for a specific user
   */
  async getUserNotifications(userId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(50),
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Failed to fetch user notifications:', error);
      return [];
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      return await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        notificationId,
        {
          read: true,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      const unreadNotifications = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        [
          Query.equal('userId', userId),
          Query.equal('read', false),
          Query.limit(100),
        ]
      );

      const promises = unreadNotifications.documents.map((doc) =>
        databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.notifications,
          doc.$id,
          {
            read: true,
            updatedAt: new Date().toISOString(),
          }
        )
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  /**
   * Delete a notification document
   */
  async deleteNotification(notificationId: string) {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        notificationId
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }
};
