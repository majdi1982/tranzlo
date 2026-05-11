"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { Job, JobStatus } from "@/types";
import { revalidatePath } from "next/cache";

export async function createJob(formData: any) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const job = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId, // Using the projects collection as jobs
      ID.unique(),
      {
        companyId: user.$id,
        title: formData.title,
        description: formData.description,
        sourceLanguage: formData.sourceLanguage,
        targetLanguage: formData.targetLanguage,
        budget: formData.budget,
        deadline: formData.deadline,
        status: "published", // Default to published for MVP
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath("/dashboard");
    return { success: true, data: job };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getJobs(queries: string[] = []) {
  const { databases } = await createAdminClient();

  try {
    const jobs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      [Query.orderDesc("createdAt"), ...queries]
    );
    return { success: true, data: jobs.documents as unknown as Job[] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getJobById(jobId: string) {
  const { databases } = await createAdminClient();

  try {
    const job = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      jobId
    );
    return { success: true, data: job as unknown as Job };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const { databases } = await createSessionClient();

  try {
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      jobId,
      { status }
    );
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
