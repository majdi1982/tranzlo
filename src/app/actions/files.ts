'use server';

import { createSessionClient } from '@/lib/server/appwrite';
import { ID } from 'node-appwrite';

const BUCKET_ID = process.env.APPWRITE_STORAGE_ID!;

export async function uploadJobAttachment(formData: FormData): Promise<{
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
} | { error: string }> {
  const file = formData.get('file') as File | null;

  if (!file) return { error: 'No file provided' };

  // 20MB limit
  if (file.size > 20 * 1024 * 1024) {
    return { error: 'File too large. Maximum size is 20MB.' };
  }

  const allowed = ['xlsx', 'xls', 'csv', 'pdf', 'doc', 'docx', 'txt', 'zip'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!allowed.includes(ext)) {
    return { error: `File type .${ext} is not allowed.` };
  }

  try {
    const { storage } = await createSessionClient();
    
    const uploaded = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    );

    return {
      fileId: uploaded.$id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (err) {
    console.error('File upload error:', err);
    return { error: 'Upload failed. Please try again.' };
  }
}

export async function getFileDownloadUrl(fileId: string): Promise<string> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${projectId}`;
}

export async function getFileViewUrl(fileId: string): Promise<string> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
}

export async function deleteJobAttachment(fileId: string): Promise<void> {
  try {
    const { storage } = await createSessionClient() as any;
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}
