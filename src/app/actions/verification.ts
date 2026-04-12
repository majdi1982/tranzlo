'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DB_ID = '69da165d00335f7a350e';
const VERIFICATIONS_ID = 'verifications';
const BUCKET_ID = 'verifications'; // Standard bucket name

export async function uploadVerificationDoc(formData: FormData) {
  try {
    const { storage, databases, account } = await createSessionClient();
    const user = await account.get();
    
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;

    if (!file) throw new Error("No file provided");

    // 1. Upload file to Appwrite Storage
    const uploadedFile = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    );

    // 2. Create verification record in DB
    await databases.createDocument(
      DB_ID,
      VERIFICATIONS_ID,
      ID.unique(),
      {
        userId: user.$id,
        userName: user.name,
        userEmail: user.email,
        documentType: documentType,
        fileId: uploadedFile.$id,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    );

    revalidatePath('/dashboard/verification');
    return { success: true };

  } catch (error: any) {
    console.error('Verification upload failed', error);
    return { success: false, error: error.message || 'Failed to upload verification documents.' };
  }
}

export async function getVerificationStatus() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const response = await databases.listDocuments(DB_ID, VERIFICATIONS_ID, [
        // Query logic would go here, for now return null to show 'Not Started'
    ]);
    
    return response.documents[0] || null;
  } catch {
    return null;
  }
}
