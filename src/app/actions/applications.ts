'use server';

import { createSessionClient } from '@/lib/server/appwrite';
import { ID } from 'node-appwrite';
import { redirect } from 'next/navigation';

export async function applyToJob(formData: FormData) {
  const dbId = '69da165d00335f7a350e';
  const collectionId = 'job_applications';

  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const payload = {
      jobId: formData.get('jobId') as string,
      translatorId: user.$id,
      coverMessage: formData.get('coverMessage') as string,
      proposedRateType: formData.get('proposedRateType') as string || 'fixed',
      proposedRateAmount: parseFloat(formData.get('proposedRateAmount') as string) || 0,
      currency: formData.get('currency') as string || 'USD',
      estimatedDeliveryAt: formData.get('estimatedDeliveryAt') ? new Date(formData.get('estimatedDeliveryAt') as string).toISOString() : null,
      status: 'submitted'
    };

    await databases.createDocument(
      dbId, 
      collectionId, 
      ID.unique(), 
      payload
    );

    return { success: true };
  } catch (error: any) {
    console.error('Application submission failed', error);
    return { success: false, error: error.message || 'Failed to submit application.' };
  }
}

export async function getApplication(appId: string) {
  const dbId = '69da165d00335f7a350e';
  const collectionId = 'job_applications';

  try {
    const { databases } = await createSessionClient();
    const app = await databases.getDocument(dbId, collectionId, appId);
    return app;
  } catch (error: any) {
    console.error('Failed to get application', error);
    return null;
  }
}
