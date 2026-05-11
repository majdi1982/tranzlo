"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";

export async function getDashboardData() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    const isCompany = (user.prefs as any)?.role === "company";

    // 1. Fetch Projects
    let projectsQuery = [Query.orderDesc("$createdAt"), Query.limit(5)];
    if (isCompany) {
      projectsQuery.push(Query.equal("ownerId", user.$id));
    }

    const projectsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.projectsCollectionId,
      projectsQuery
    );

    // 2. Mock Stats (until we have real data for earnings/completed jobs)
    const stats = {
      totalProjects: projectsResponse.total,
      pendingProjects: projectsResponse.documents.filter((p: any) => p.status === "open").length,
      completedProjects: projectsResponse.documents.filter((p: any) => p.status === "completed").length,
      earnings: isCompany ? 0 : 1250, // Placeholder
      totalBudget: isCompany ? projectsResponse.documents.reduce((acc: number, p: any) => acc + (p.budget || 0), 0) : 0,
    };

    return {
      success: true,
      stats,
      recentProjects: projectsResponse.documents,
      user: {
          name: user.name,
          role: (user.prefs as any)?.role
      }
    };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error.message);
    return { success: false, error: error.message };
  }
}
