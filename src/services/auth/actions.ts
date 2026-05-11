"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logout() {
  (await cookies()).delete("appwrite-session");
  redirect("/login");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  const { account, databases } = await createAdminClient();

  try {
    const user = await account.create(ID.unique(), email, password, name);
    
    // 1. Central Profile (All users)
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      user.$id,
      { 
        role, 
        name, 
        email, 
        country: formData.get("country") as string,
        createdAt: new Date().toISOString() 
      }
    );

    // 2. Role-specific collection
    const targetCollection = role === "company" ? APPWRITE_CONFIG.companiesCollectionId : APPWRITE_CONFIG.translatorsCollectionId;
    const roleData = role === "company" 
      ? { userId: user.$id, companyName: name, contactName: name, email, country: formData.get("country"), createdAt: new Date().toISOString() }
      : { userId: user.$id, name, email, languages: [], country: formData.get("country"), createdAt: new Date().toISOString() };

    await databases.createDocument(APPWRITE_CONFIG.databaseId, targetCollection, user.$id, roleData);

    await login(formData);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateProfile(data: { name?: string, prefs?: any }) {
  try {
    const { account } = await createSessionClient();
    
    if (data.name) {
      await account.updateName(data.name);
    }
    
    if (data.prefs) {
      const current = await account.get();
      await account.updatePrefs({ ...current.prefs, ...data.prefs });
    }
    
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadDocument(file: File) {
  try {
    const { storage } = await createSessionClient();
    const response = await storage.createFile(
      APPWRITE_CONFIG.bucketId,
      ID.unique(),
      file
    );
    return { success: true, fileId: response.$id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEmail(newEmail: string, password?: string) {
  try {
    const { account } = await createSessionClient();
    await account.updateEmail(newEmail, password || "");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePassword(newPassword: string, oldPassword?: string) {
  try {
    const { account } = await createSessionClient();
    await account.updatePassword(newPassword, oldPassword || "");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession("current");
    // Optionally delete the user from DB too if desired
    redirect("/login");
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginWithOAuth(provider: "google" | "linkedin") {
  return { provider };
}

export async function completeOAuthOnboarding(formData: FormData) {
  const userId = formData.get("userId") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  
  const { databases } = await createAdminClient();

  try {
    try {
      await databases.getDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.usersCollectionId, userId);
      return { success: true };
    } catch (e) {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.usersCollectionId,
        userId,
        { 
          role, name, email, 
          country: formData.get("country") as string,
          avatarUrl: formData.get("avatar") as string || "",
          companyName: formData.get("companyName") as string,
          languages: (formData.get("languages") as string)?.split(",").map(l => l.trim()),
          createdAt: new Date().toISOString() 
        }
      );

      const targetCollection = role === "company" ? APPWRITE_CONFIG.companiesCollectionId : APPWRITE_CONFIG.translatorsCollectionId;
      const roleData = role === "company" 
        ? { userId, companyName: formData.get("companyName") as string, contactName: name, email, country: formData.get("country") as string, createdAt: new Date().toISOString() }
        : { userId, name, email, languages: (formData.get("languages") as string)?.split(",").map(l => l.trim()), country: formData.get("country") as string, avatarUrl: formData.get("avatar") as string || "", createdAt: new Date().toISOString() };

      await databases.createDocument(APPWRITE_CONFIG.databaseId, targetCollection, userId, roleData);
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
