"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

export async function createTicket(subject: string, description: string, priority: string = "Medium") {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const ticket = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      "tickets",
      ID.unique(),
      {
        userId: user.$id,
        userName: user.name,
        subject,
        description,
        status: "Open",
        priority,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath("/dashboard/support");
    return { success: true, ticket: JSON.parse(JSON.stringify(ticket)) };
  } catch (error: any) {
    console.error("Error creating ticket:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getMyTickets() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "tickets",
      [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt")
      ]
    );

    return { success: true, tickets: JSON.parse(JSON.stringify(response.documents)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
