'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

export interface ChatMessage {
  $id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  $createdAt: string;
}

export interface Conversation {
  $id: string;
  participants: string[];
  jobId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

/**
 * Starts a new conversation or returns existing one between participants.
 */
export async function startConversation(participants: string[], jobId?: string) {
  try {
    const { databases } = await createAdminClient();
    
    // Check for existing conversation with these participants
    const existing = await databases.listDocuments(DB_ID, 'conversations', [
      Query.contains('participants', participants[0]),
      Query.contains('participants', participants[1]),
      ...(jobId ? [Query.equal('jobId', jobId)] : [])
    ]);

    if (existing.total > 0) {
      return existing.documents[0] as unknown as Conversation;
    }

    const convo = await databases.createDocument(DB_ID, 'conversations', ID.unique(), {
      participants,
      jobId,
      lastMessageAt: new Date().toISOString()
    });

    return convo as unknown as Conversation;
  } catch (error) {
    console.error('Failed to start conversation:', error);
    return null;
  }
}

/**
 * Sends a message and updates the conversation state.
 */
export async function sendMessage(conversationId: string, content: string) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    // 1. Create message
    const message = await databases.createDocument(DB_ID, 'messages', ID.unique(), {
      conversationId,
      senderId: user.$id,
      senderName: user.name,
      content
    });

    // 2. Update conversation
    await databases.updateDocument(DB_ID, 'conversations', conversationId, {
      lastMessage: content,
      lastMessageAt: new Date().toISOString()
    });

    return { success: true, messageId: message.$id };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Fetches message history for a conversation.
 */
export async function getMessageHistory(conversationId: string, limit = 50) {
  try {
    const { databases } = await createSessionClient();
    const response = await databases.listDocuments(DB_ID, 'messages', [
      Query.equal('conversationId', conversationId),
      Query.orderAsc('$createdAt'),
      Query.limit(limit)
    ]);

    return response.documents as unknown as ChatMessage[];
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
}

/**
 * Lists conversations for the current user.
 */
export async function listConversations() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const response = await databases.listDocuments(DB_ID, 'conversations', [
      Query.contains('participants', user.$id),
      Query.orderDesc('lastMessageAt')
    ]);

    return response.documents as unknown as Conversation[];
  } catch (error) {
    console.error('Failed to list conversations:', error);
    return [];
  }
}
