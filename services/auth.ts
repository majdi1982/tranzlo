import { ID, Query } from "appwrite";
import { account, databases } from "@/lib/appwrite/client";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { cookies } from "next/headers";

// This will be used in Server Actions
export async function signUp({ email, password, name, role }: any) {
  const { account: adminAccount } = await createAdminClient();

  // 1. Create User Account
  const newUser = await adminAccount.create(ID.unique(), email, password, name);

  // 2. Add role to preferences (or separate profile collection)
  await adminAccount.updatePrefs({ role });

  // 3. Create session (need to do this separately as admin client creates, doesn't sign in)
  // For security, we usually return success and ask user to login, 
  // or we use the client-side SDK for the actual sign-in to get the session cookie.
  
  return newUser;
}

export async function signIn({ email, password }: any) {
  // We use the client-side SDK in the component to handle session cookies automatically,
  // but for Server Actions, we'd need to manually set cookies if using node-appwrite.
  // However, Next.js + Appwrite best practice is often:
  // 1. Client-side sign-in -> Appwrite sets session cookie.
  // 2. Server-side createSessionClient -> Reads cookie.
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch (error) {
    return null;
  }
}

export async function signOut() {
  try {
    const { account } = await createSessionClient();
    (await cookies()).delete("session");
    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
}
