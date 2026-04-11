'use server';

import { createAdminClient } from '@/lib/server/appwrite';
import { Query } from 'node-appwrite';

const DB_ID = '69da165d00335f7a350e';
const COLLECTION_ID = 'blog_posts';

export async function getBlogPosts(limit = 10) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.limit(limit),
      Query.orderDesc('$createdAt'),
      Query.equal('published', true)
    ]);
    return response.documents;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('slug', slug),
      Query.limit(1)
    ]);
    return response.documents[0] || null;
  } catch (error) {
    console.error('Failed to fetch post by slug:', error);
    return null;
  }
}
