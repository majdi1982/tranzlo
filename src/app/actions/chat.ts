'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID, Query } from 'node-appwrite';

const DB_ID = '69da165d00335f7a350e';

export interface ChatMessage {
  $id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachments?: string[];
  $createdAt: string;
}

export interface Conversation {
  $id: string;
  participants: string[];
  relatedJobId?: string;
  lastMessage?: string;
  $createdAt: string;
  $updatedAt: string;
}

export async function createConversation(participantIds: string[], jobId?: string) {
  try {
    const { databases } = await createSessionClient();
    const doc = await databases.createDocument(DB_ID, 'conversations', ID.unique(), {
      participants: participantIds,
      relatedJobId: jobId || null
    });
    return { success: true, data: doc };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendMessage(conversationId: string, text: string, attachments: string[] = []) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    const doc = await databases.createDocument(DB_ID, 'messages', ID.unique(), {
      conversationId,
      senderId: user.$id,
      text,
      attachments
    });
    return { success: true, data: doc };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const { databases } = await createSessionClient();
    const res = await databases.listDocuments(DB_ID, 'messages', [
      Query.equal('conversationId', conversationId),
      Query.orderAsc('$createdAt'),
      Query.limit(100)
    ]);
    return res.documents;
  } catch (error) {
    console.error('Failed to get messages', error);
    return [];
  }
}

export async function listConversations() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    
    // In Appwrite, we usually filter where participants array contains user ID
    // Note: Query.contains is used for array attributes
    const res = await databases.listDocuments(DB_ID, 'conversations', [
      Query.contains('participants', [user.$id])
    ]);
    
    return res.documents;
  } catch (error) {
    console.error('Failed to list conversations', error);
    return [];
  }
}
