'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { Query } from 'node-appwrite';

const DB_ID = '69da165d00335f7a350e';
const JOBS_COLLECTION = 'jobs';

export async function getHubData(userId: string, role: string) {
  try {
    const { databases } = await createAdminClient();
    
    // 1. Fetch Latest General Jobs (for everyone)
    const recentJobsResponse = await databases.listDocuments(DB_ID, JOBS_COLLECTION, [
      Query.equal('status', 'published'),
      Query.orderDesc('$createdAt'),
      Query.limit(5)
    ]);

    let myJobsResponse = { documents: [], total: 0 };
    
    // 2. If it's a company, fetch THEIR jobs
    if (role === 'company') {
      myJobsResponse = await databases.listDocuments(DB_ID, JOBS_COLLECTION, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(5)
      ]);
    }

    return {
      success: true,
      jobs: recentJobsResponse.documents.map(job => mapJob(job)),
      myJobs: myJobsResponse.documents.map(job => mapJob(job)),
      community: [] // Placeholder since collection doesn't exist
    };

  } catch (error: any) {
    console.error('Failed to fetch Hub data', error);
    return { 
      success: false, 
      jobs: [], 
      myJobs: [], 
      community: [],
      error: error.message 
    };
  }
}

// Internal helper to map Appwrite document to UI Props
function mapJob(doc: any) {
  return {
    id: doc.$id,
    title: doc.jobTitle || 'Untitled Job',
    sourceLang: doc.sourceLanguage || '??',
    targetLangs: doc.targetLanguages || [],
    budget: doc.budgetAmount ? (doc.budgetType === 'fixed' ? `$${doc.budgetAmount}` : `$${doc.budgetAmount}/word`) : 'Negotiable',
    type: doc.serviceType || 'Translation',
    timeAgo: doc.$createdAt, // We'll format this on the client or in a helper
    userId: doc.userId
  };
}
