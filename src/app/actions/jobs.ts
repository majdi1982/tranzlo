'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID } from 'node-appwrite';
import { redirect } from 'next/navigation';

export async function createJob(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const sourceLang = formData.get('sourceLang') as string;
  const targetLang = formData.get('targetLang') as string;
  const serviceType = formData.get('serviceType') as string;

  try {
    const { databases } = await createSessionClient();
    
    // In actual implementation, we read from specific collections. 
    // Here we use the database ID from env and a hypothetical 'jobs' collection ID
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    // Note: We need the actual collection ID from Appwrite layout. We will assume 'jobs' for mock.
    const collectionId = 'jobs'; 
    
    /* Document expected structure:
      title: string
      description: string
      sourceLanguage: string
      targetLanguages: string[]
      serviceType: string
      status: string
    */

    await databases.createDocument(
      dbId, 
      collectionId, 
      ID.unique(), 
      {
        jobTitle: title,
        description,
        sourceLanguage: sourceLang,
        targetLanguages: [targetLang],
        serviceType,
        status: 'published'
      }
    );

    redirect('/dashboard/company');
  } catch (error) {
    console.error('Job creation failed', error);
    return { error: 'Failed to create job' };
  }
}
