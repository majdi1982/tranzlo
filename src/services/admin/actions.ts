"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query, Users } from "node-appwrite";
import { revalidatePath } from "next/cache";

export async function sendBroadcast(target: "all" | "translators" | "companies", title: string, content: string) {
  try {
    const { databases, account } = await createSessionClient();
    
    // 1. Check if requester is Admin
    const user = await account.get();
    if ((user.prefs as any)?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can send broadcasts.");
    }

    // 2. Fetch target users
    // Note: To fetch all users efficiently, we would ideally query the 'users' collection we created.
    let queries: any[] = [];
    if (target === "translators") queries.push(Query.equal("role", "translator"));
    if (target === "companies") queries.push(Query.equal("role", "company"));

    const usersResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      queries
    );

    const recipients = usersResponse.documents;

    // 3. Create notifications for each user
    const notificationPromises = recipients.map(recipient => {
      return databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        "notifications",
        ID.unique(),
        {
          userId: recipient.$id,
          title,
          message: content, // This can contain HTML
          type: "broadcast",
          read: false,
          createdAt: new Date().toISOString()
        }
      );
    });

    await Promise.all(notificationPromises);

    return { success: true, count: recipients.length };
  } catch (error: any) {
    console.error("Broadcast Error:", error.message);
    return { success: false, error: error.message };
  }
}
