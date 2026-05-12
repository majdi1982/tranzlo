"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { Job, JobStatus, JobType, ApplicationStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { generateTrzId, redis } from "@/lib/redis";
import { logAudit } from "@/services/audit/actions";
import { sendNotification } from "@/services/notifications/actions";

/**
 * JOBS SYSTEM - UNIFIED SERVICE
 * Adheres to MASTER SYSTEM ARCHITECTURE and DATABASE SCHEMA LAW.
 */

export async function createJob(data: {
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  budget: number;
  deadline: string;
  jobType: JobType;
  isInviteOnly: boolean;
  milestones?: any[];
}) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const publicId = await generateTrzId("JOB");
    const now = new Date().toISOString();

    const jobData = {
      publicId,
      entityType: "job",
      companyId: user.$id,
      title: data.title,
      description: data.description,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      budget: data.budget,
      deadline: data.deadline,
      status: "active",
      visibility: data.isInviteOnly ? "private" : "public",
      jobType: data.jobType,
      isInviteOnly: data.isInviteOnly,
      applicationCount: 0,
      viewCount: 0,
      milestones: data.milestones ? JSON.stringify(data.milestones) : undefined,
      createdBy: user.$id,
      updatedBy: user.$id,
      createdAt: now,
      updatedAt: now,
      metadata: JSON.stringify({}),
    };

    const job = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      ID.unique(),
      jobData
    );

    // Initial audit log
    await logAudit(user.$id, "create", "job", job.$id, { publicId });

    // Initialize real-time counter in Redis
    await redis.set(`job:${job.$id}:applications`, 0);
    await redis.set(`job:${job.$id}:views`, 0);

    revalidatePath("/dashboard");
    revalidatePath("/marketplace");

    return { success: true, data: JSON.parse(JSON.stringify(job)) as Job };
  } catch (error: any) {
    console.error("Job Creation Error:", error.message);
    return { error: error.message };
  }
}

export async function getJobs(filters: any = {}) {
  const { databases } = await createAdminClient();
  const queries = [Query.orderDesc("createdAt")];

  if (filters.status) queries.push(Query.equal("status", filters.status));
  if (filters.jobType) queries.push(Query.equal("jobType", filters.jobType));
  if (filters.isInviteOnly !== undefined) queries.push(Query.equal("isInviteOnly", filters.isInviteOnly));

  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      queries
    );
    return { success: true, data: response.documents as unknown as Job[] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getJobWithBids(jobId: string) {
  const { databases } = await createAdminClient();
  
  try {
    const job = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId
    );

    const bids = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobApplicationsCollectionId,
      [Query.equal("jobId", jobId), Query.orderDesc("createdAt")]
    );

    return { 
      project: JSON.parse(JSON.stringify(job)) as Job, 
      bids: JSON.parse(JSON.stringify(bids.documents)) 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function applyToJob(jobId: string, data: {
  proposalText: string;
  price: number;
  deliveryTime: string;
}) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const publicId = await generateTrzId("APP");
    const now = new Date().toISOString();

    // 1. Create the application (bid)
    const application = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobApplicationsCollectionId,
      ID.unique(),
      {
        publicId,
        entityType: "jobApplication",
        jobId,
        translatorId: user.$id,
        proposalText: data.proposalText,
        price: data.price,
        deliveryTime: data.deliveryTime,
        status: "pending",
        visibility: "internal",
        createdBy: user.$id,
        updatedBy: user.$id,
        createdAt: now,
        updatedAt: now,
        metadata: JSON.stringify({}),
      }
    );

    // 2. Increment counter in Redis (Real-time)
    const newCount = await redis.incr(`job:${jobId}:applications`);

    // 3. Update Appwrite counter (Persistence)
    const { databases: adminDb } = await createAdminClient();
    await adminDb.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId,
      { applicationCount: newCount }
    );

    // 4. Send Notification to Job Owner
    const job = await adminDb.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId
    );

    await sendNotification({
      userId: job.companyId,
      type: "info",
      content: `New application received for your job: ${job.title}`,
      link: `/dashboard/jobs/${jobId}`,
      metadata: { jobId, applicationId: application.$id }
    });

    // 5. Audit Log
    await logAudit(user.$id, "apply", "application", application.$id, { jobId, publicId });

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true, data: JSON.parse(JSON.stringify(application)) };
  } catch (error: any) {
    console.error("Application Error:", error.message);
    return { error: error.message };
  }
}

export async function incrementJobViews(jobId: string) {
  try {
    const newCount = await redis.incr(`job:${jobId}:views`);
    // Throttle sync to database
    if (newCount % 5 === 0) {
      const { databases } = await createAdminClient();
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.jobsCollectionId,
        jobId,
        { viewCount: newCount }
      );
    }
    return { success: true, views: newCount };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const now = new Date().toISOString();
    const oldJob = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId
    );

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId,
      { 
        status, 
        updatedAt: now,
        updatedBy: user.$id 
      }
    );

    await logAudit(user.$id, "status_change", "job", jobId, { 
      oldStatus: oldJob.status, 
      newStatus: status 
    });

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getCompanyProjects() {
  const { databases, account } = await createSessionClient();
  
  try {
    const user = await account.get();
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      [Query.equal("companyId", user.$id), Query.orderDesc("createdAt")]
    );
    return { success: true, data: response.documents as unknown as Job[] };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getJobById(jobId: string) {
  const { databases } = await createAdminClient();
  
  try {
    const job = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId
    );
    return { success: true, data: job as unknown as Job };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getMyApplications() {
  const { databases, account } = await createSessionClient();
  
  try {
    const user = await account.get();
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobApplicationsCollectionId,
      [Query.equal("translatorId", user.$id), Query.orderDesc("createdAt")]
    );
    return { success: true, data: response.documents };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function hireTranslator(jobId: string, translatorId: string, applicationId: string) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();
  const now = new Date().toISOString();

  try {
    // 1. Update Job Status and Hired Translator
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobsCollectionId,
      jobId,
      {
        status: "in_progress",
        hiredTranslatorId: translatorId,
        updatedAt: now,
        updatedBy: user.$id
      }
    );

    // 2. Update Application Status
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.jobApplicationsCollectionId,
      applicationId,
      {
        status: "accepted",
        updatedAt: now,
        updatedBy: user.$id
      }
    );

    // 3. Notify Translator
    await sendNotification({
      userId: translatorId,
      type: "success",
      content: `Congratulations! You have been hired for the job: ${jobId}`,
      link: `/dashboard/jobs/${jobId}`
    });

    // 4. Audit Log
    await logAudit(user.$id, "hire", "job", jobId, { translatorId, applicationId });

    revalidatePath(`/dashboard/jobs/${jobId}`);
    revalidatePath("/dashboard/projects");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
