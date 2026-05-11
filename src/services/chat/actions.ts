"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { Message, ChatRoom } from "@/types";
import { revalidatePath } from "next/cache";

export async function getChatRoom(jobId: string) {
  const { databases } = await createAdminClient();

  try {
    const rooms = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.chatRoomsCollectionId,
      [Query.equal("jobId", jobId)]
    );

    if (rooms.total > 0) {
      return { success: true, data: rooms.documents[0] as unknown as ChatRoom };
    }

    return { success: false, error: "Chat room not found" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function sendMessage(chatRoomId: string, content: string, type: "text" | "system" = "text") {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const message = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesCollectionId,
      ID.unique(),
      {
        chatRoomId,
        senderId: user.$id,
        content,
        type,
        createdAt: new Date().toISOString(),
      }
    );

    return { success: true, data: message };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getMessages(chatRoomId: string) {
  const { databases } = await createAdminClient();

  try {
    const messages = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesCollectionId,
      [Query.equal("chatRoomId", chatRoomId), Query.orderAsc("createdAt")]
    );

    return { success: true, data: messages.documents as unknown as Message[] };
  } catch (error: any) {
    return { error: error.message };
  }
}
