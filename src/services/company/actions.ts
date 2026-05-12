"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

export async function getProfile() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    
    // 1. Get role from the database user document (Source of Truth)
    const userDoc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        user.$id
    );
    const role = (userDoc as any).role || (user.prefs as any)?.role || "translator";
    
    // 2. Fetch role-specific profile
    const collectionId = role === "company" ? APPWRITE_CONFIG.companiesCollectionId : APPWRITE_CONFIG.translatorsCollectionId;
    const profile = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      collectionId,
      user.$id
    );
    
    return { success: true, data: JSON.parse(JSON.stringify(profile)), role };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfileDoc(data: any) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    const role = (user.prefs as any)?.role || "translator";
    const collectionId = role === "company" ? APPWRITE_CONFIG.companiesCollectionId : APPWRITE_CONFIG.translatorsCollectionId;
    
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      collectionId,
      user.$id,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
    
    if (data.name || data.companyName) {
        await account.updateName(data.name || data.companyName);
    }
    
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadProfileImage(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file) throw new Error("No file provided");

    const { storage, databases, account } = await createSessionClient();
    const user = await account.get();
    const role = (user.prefs as any)?.role || "translator";
    const collectionId = role === "company" ? APPWRITE_CONFIG.companiesCollectionId : APPWRITE_CONFIG.translatorsCollectionId;

    const uploadedFile = await storage.createFile(
      APPWRITE_CONFIG.bucketId,
      ID.unique(),
      file
    );

    const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (role === "company") updateData.logoUrl = fileUrl;
    else updateData.avatarUrl = fileUrl;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      collectionId,
      user.$id,
      updateData
    );

    // Update main users collection as well
    await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        user.$id,
        { avatarUrl: fileUrl, updatedAt: new Date().toISOString() }
    );

    // Use Admin Client to update prefs to avoid session sync issues
    const { users } = await createAdminClient();
    const currentPrefs = user.prefs as any;
    await users.updatePrefs(user.$id, {
        ...currentPrefs,
        avatar: fileUrl
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/");
    return { success: true, url: fileUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
