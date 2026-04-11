'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

const DB_ID = '69da165d00335f7a350e';
const COLLECTION_ID = 'job_applications';

/**
 * Company sends an offer to a translator based on their application.
 */
export async function sendOffer(applicationId: string, data: {
  price: number;
  deadline: string;
  terms: string;
}) {
  try {
    const { databases } = await createSessionClient();
    
    // 1. Update Application status and add offer details
    const application = await databases.updateDocument(DB_ID, COLLECTION_ID, applicationId, {
      proposedRateAmount: data.price, // Aligning with V4 bidding fields for 'accepted' offer
      estimatedDeliveryAt: data.deadline,
      coverMessage: `[OFFER] ${data.terms}`, // Or add a formal field if needed, but sticking to V4 schema
      status: 'offer_sent'
    });

    // 2. Notify the translator
    await createNotification(
      application.translatorId,
      'New Offer Received!',
      `A company sent you a formal offer ($${data.price}) for your application.`,
      'job',
      `/dashboard/translator/offers/${applicationId}`
    );

    revalidatePath(`/dashboard/company/jobs/${application.jobId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send offer:', error);
    return { success: false, error: error.message || 'Failed to send formal offer' };
  }
}

/**
 * Translator accepts an offer.
 */
export async function acceptOffer(applicationId: string) {
  try {
    const { databases } = await createSessionClient();
    
    // 1. Mark as accepted
    const application = await databases.updateDocument(DB_ID, COLLECTION_ID, applicationId, {
      status: 'accepted'
    });

    // 2. Get Job details
    const job = await databases.getDocument(DB_ID, 'jobs', application.jobId);

    // 3. Notify the company
    await createNotification(
      job.clientId,
      'Offer Accepted!',
      `A translator accepted your offer for "${job.jobTitle}".`,
      'job',
      `/dashboard/company/jobs/${application.jobId}`
    );

    revalidatePath('/dashboard/translator');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to accept offer:', error);
    return { success: false, error: error.message || 'Failed to accept offer' };
  }
}
