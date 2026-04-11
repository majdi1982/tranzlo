'use server';

import { createSessionClient } from '@/lib/server/appwrite';
import { triggerN8NWorkflow } from '@/lib/server/n8n';
import { ID } from 'node-appwrite';
import { redirect } from 'next/navigation';

export async function applyForJob(formData: FormData) {
  const jobId = formData.get('jobId') as string;
  const coverLetter = formData.get('coverLetter') as string;
  const proposedPrice = formData.get('proposedPrice') as string;

  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    const collectionId = 'applications';

    // Fetch job to get companyId for notification
    const jobDoc = await databases.getDocument(dbId, 'jobs', jobId);
    const companyId = jobDoc.companyId || jobDoc.userId || ''; // Assuming one of these holds the creator ID

    const applicationDoc = await databases.createDocument(
      dbId, 
      collectionId, 
      ID.unique(), 
      {
        jobId,
        translatorId: user.$id,
        translatorName: user.name,
        coverLetter,
        proposedPrice: parseFloat(proposedPrice),
        status: 'pending',
      }
    );

    // Create In-App Notification for the company
    if (companyId) {
      const { createNotification } = await import('./notifications');
      await createNotification({
        userId: companyId,
        title: 'New Job Application',
        message: `${user.name} applied for "${jobDoc.jobTitle}"`,
        type: 'job',
        link: `/dashboard/company/jobs/${jobId}/applications/${applicationDoc.$id}`
      });
    }

    // Trigger n8n Automation workflow upon successful application
    await triggerN8NWorkflow('new-application', {
      jobId,
      translatorId: user.$id,
      translatorName: user.name,
      proposedPrice,
      applicationId: applicationDoc.$id
    });

    redirect(`/dashboard/translator`);
  } catch (error) {
    console.error('Job application failed', error);
    return { error: 'Failed to submit application' };
  }
}

export async function getApplication(id: string) {
  try {
    const { databases } = await createSessionClient();
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    return await databases.getDocument(dbId, 'applications', id);
  } catch (error) {
    console.error('Failed to get application:', error);
    return null;
  }
}

