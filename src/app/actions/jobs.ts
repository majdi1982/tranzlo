'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID } from 'node-appwrite';
import { redirect } from 'next/navigation';

export async function createJob(formData: FormData) {
  const dbId = '69da165d00335f7a350e';
  const collectionId = 'jobs';

  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const payload = {
      jobTitle: formData.get('title') as string,
      serviceType: formData.get('serviceType') as string,
      sourceLanguage: formData.get('sourceLang') as string,
      targetLanguages: [formData.get('targetLang') as string],
      description: formData.get('description') as string,
      wordCount: parseInt(formData.get('wordCount') as string) || 0,
      budgetType: formData.get('budgetType') as string || 'fixed',
      budgetAmount: parseFloat(formData.get('budgetAmount') as string) || 0,
      workMode: formData.get('workMode') as string || 'remote',
      deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : null,
      status: 'published',
      attachments: formData.getAll('attachmentIds[]') as string[]
    };

    await databases.createDocument(
      dbId, 
      collectionId, 
      ID.unique(), 
      payload
    );

  } catch (error: any) {
    console.error('Job creation failed', error);
    return { success: false, error: error.message || 'Failed to create job.' };
  }

  // Redirect on success
  redirect('/dashboard/company');
}
