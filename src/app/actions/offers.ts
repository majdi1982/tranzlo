'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'applications';

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
      offeredPrice: data.price,
      offeredDeadline: data.deadline,
      offerTerms: data.terms,
      status: 'offer_sent'
    });

    // 2. Notify the translator
    await createNotification({
      userId: application.translatorId,
      title: 'New Offer Received!',
      message: `A company sent you a formal offer ($${data.price}) for your application.`,
      type: 'job',
      link: `/dashboard/translator/offers/${applicationId}`
    });

    revalidatePath(`/dashboard/company/jobs/${application.jobId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send offer:', error);
    return { success: false, error: 'Failed to send formal offer' };
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

    // 2. Get Job details for the notification
    const job = await databases.getDocument(DB_ID, 'jobs', application.jobId);

    // 3. Notify the company
    await createNotification({
      userId: job.companyId || job.userId,
      title: 'Offer Accepted!',
      message: `${application.translatorName} accepted your offer for "${job.jobTitle}".`,
      type: 'job',
      link: `/dashboard/company/jobs/${application.jobId}`
    });

    revalidatePath('/dashboard/translator');
    return { success: true };
  } catch (error) {
    console.error('Failed to accept offer:', error);
    return { success: false, error: 'Failed to accept offer' };
  }
}
