"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

export async function createPost(title: string, content: string, tags: string[] = []) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const post = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      "posts",
      ID.unique(),
      {
        title,
        content,
        authorId: user.$id,
        authorName: user.name,
        tags,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath("/community");
    return { success: true, post: JSON.parse(JSON.stringify(post)) };
  } catch (error: any) {
    console.error("Error creating post:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getPosts() {
  try {
    const { databases } = await createSessionClient();

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "posts",
      [Query.orderDesc("$createdAt")]
    );

    return { success: true, posts: JSON.parse(JSON.stringify(response.documents)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addComment(parentId: string, content: string) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const comment = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      "comments",
      ID.unique(),
      {
        parentId,
        authorId: user.$id,
        authorName: user.name,
        content,
        createdAt: new Date().toISOString(),
      }
    );

    return { success: true, comment: JSON.parse(JSON.stringify(comment)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getComments(parentId: string) {
    try {
      const { databases } = await createSessionClient();
  
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        "comments",
        [Query.equal("parentId", parentId), Query.orderAsc("$createdAt")]
      );
  
      return { success: true, comments: JSON.parse(JSON.stringify(response.documents)) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
