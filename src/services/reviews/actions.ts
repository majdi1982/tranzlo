"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { Review } from "@/types";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/services/notifications/actions";

export async function submitReview(jobId: string, revieweeId: string, rating: number, comment?: string) {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  try {
    const review = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.reviewsCollectionId,
      ID.unique(),
      {
        jobId,
        reviewerId: user.$id,
        revieweeId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      }
    );

    // Update reviewee's average rating (simplified logic)
    const profile = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      revieweeId
    );
    
    const currentRating = profile.rating || 0;
    // For MVP, just update with latest or simple average
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      revieweeId,
      { rating: (currentRating + rating) / 2 }
    );

    // Notify reviewee
    await createNotification(
      revieweeId,
      "review",
      `You have received a new review: ${rating} stars.`,
      `/profile/${revieweeId}`
    );

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true, data: review };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getReviewsForUser(userId: string) {
  const { databases } = await createAdminClient();

  try {
    const reviews = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.reviewsCollectionId,
      [Query.equal("revieweeId", userId), Query.orderDesc("createdAt")]
    );
    return { success: true, data: reviews.documents as unknown as Review[] };
  } catch (error: any) {
    return { error: error.message };
  }
}
