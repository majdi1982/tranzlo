"use server";

import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";

export const signIn = async ({ email, password }: any) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error signing in", error);
    return { success: false, error: error.message };
  }
};

export const signUp = async ({ email, password, name, role }: any) => {
  try {
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Store role in preferences
    await account.updatePrefs({ role });

    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return { success: true, user: newUserAccount };
  } catch (error: any) {
    console.error("Error signing up", error);
    return { success: false, error: error.message };
  }
};

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    (await cookies()).delete("session");
    await account.deleteSession("current");
    return { success: true };
  } catch (error) {
    console.error("Error logging out", error);
    return { success: false };
  }
};
