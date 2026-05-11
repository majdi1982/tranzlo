"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

export async function createProject(data: any) {
  const { databases, account } = await createSessionClient();
  
  try {
    const user = await account.get();
    const userId = user.$id;

    const projectData = {
      title: data.title,
      description: data.description,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      deadline: data.deadline,
      budget: data.budget,
      category: data.category,
      serviceType: data.serviceType,
      experienceLevel: data.experienceLevel,
      ownerId: userId,
      status: data.status,
      createdAt: new Date().toISOString()
    };

    const project = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      ID.unique(),
      projectData
    );

    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
    
    return { success: true, project: JSON.parse(JSON.stringify(project)) };
  } catch (error: any) {
    console.error("Project Creation Error:", error.message);
    return { error: error.message };
  }
}

export async function getProjects() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      [
        Query.equal("ownerId", user.$id),
        Query.orderDesc("$createdAt")
      ]
    );

    return { success: true, projects: JSON.parse(JSON.stringify(response.documents)) };
  } catch (error: any) {
    console.error("Error fetching projects:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getProjectWithBids(projectId: string) {
  const { databases } = await createSessionClient();
  
  try {
    const project = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      projectId
    );

    const bids = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bidsCollectionId,
      [Query.equal("projectId", projectId), Query.orderDesc("createdAt")]
    );

    return { 
      project: JSON.parse(JSON.stringify(project)), 
      bids: JSON.parse(JSON.stringify(bids.documents)) 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function hireTranslator(projectId: string, translatorId: string, bidId: string) {
  const { databases } = await createSessionClient();
  
  try {
    // 1. Update project status and link translator
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      projectId,
      {
        status: "In Progress",
        hiredTranslatorId: translatorId,
        acceptedBidId: bidId
      }
    );

    // 2. Mark bid as accepted
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bidsCollectionId,
      bidId,
      { status: "Accepted" }
    );

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getAllOpenProjects() {
  try {
    const { databases } = await createSessionClient();

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      [
        Query.equal("status", "open"),
        Query.orderDesc("$createdAt")
      ]
    );

    return { success: true, projects: JSON.parse(JSON.stringify(response.documents)) };
  } catch (error: any) {
    console.error("Error fetching open projects:", error.message);
    return { success: false, error: error.message };
  }
}

export async function submitBid(projectId: string, amount: number, proposal: string) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const bidData = {
      projectId,
      translatorId: user.$id,
      translatorName: user.name,
      proposal,
      amount,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    const bid = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.bidsCollectionId,
      ID.unique(),
      bidData
    );

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, bid: JSON.parse(JSON.stringify(bid)) };
  } catch (error: any) {
    console.error("Error submitting bid:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getProjectMessages(projectId: string) {
  try {
    const { databases } = await createSessionClient();

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesCollectionId,
      [
        Query.equal("projectId", projectId),
        Query.orderAsc("$createdAt")
      ]
    );

    return { success: true, messages: JSON.parse(JSON.stringify(response.documents)) };
  } catch (error: any) {
    console.error("Error fetching messages:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendMessage(projectId: string, text: string) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const messageData = {
      projectId,
      senderId: user.$id,
      text,
      type: "text",
      createdAt: new Date().toISOString()
    };

    const message = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesCollectionId,
      ID.unique(),
      messageData
    );

    return { success: true, message: JSON.parse(JSON.stringify(message)) };
  } catch (error: any) {
    console.error("Error sending message:", error.message);
    return { success: false, error: error.message };
  }
}
export async function inviteTranslator(projectId: string, translatorId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.notificationsCollectionId, ID.unique(), {
      userId: translatorId,
      title: "New Project Invitation",
      message: `Project ID: ${projectId}`,
      type: "invitation",
      link: `/dashboard/projects/${projectId}`,
      read: false,
      createdAt: new Date().toISOString()
    });
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.projectsCollectionId, projectId, { invitedTranslatorId: translatorId });
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function respondToInvitation(projectId: string, status: "Accepted" | "Rejected") {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    if (status === "Accepted") {
      await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.projectsCollectionId, projectId, { 
        hiredTranslatorId: user.$id, status: "In Progress", invitedTranslatorId: null 
      });
    } else {
      await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.projectsCollectionId, projectId, { invitedTranslatorId: null });
    }
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}

export async function completeProject(projectId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.projectsCollectionId, projectId, { status: "Completed" });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error: any) { return { success: false, error: error.message }; }
}
