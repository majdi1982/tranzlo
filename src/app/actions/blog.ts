'use server';

import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'blog';

export interface BlogPost {
  $id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  category: string;
  featuredImage?: string;
  published: boolean;
  $createdAt: string;
}

/**
 * Fetches all published blog posts.
 */
export async function getBlogPosts(limit = 10) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('published', true),
      Query.orderDesc('$createdAt'),
      Query.limit(limit)
    ]);
    return response.documents as unknown as BlogPost[];
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

/**
 * Fetches a single blog post by slug.
 */
export async function getBlogPostBySlug(slug: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('slug', slug),
      Query.limit(1)
    ]);
    return response.documents[0] as unknown as BlogPost || null;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
}

/**
 * Creates or updates a blog post (Admin only).
 */
export async function upsertBlogPost(data: Partial<BlogPost>) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    // Verify admin label
    if (!user.labels?.includes('admin')) {
      throw new Error('Unauthorized: Admin access required');
    }

    if (data.$id) {
      const { $id, ...rest } = data;
      await databases.updateDocument(DB_ID, COLLECTION_ID, $id, rest);
    } else {
      await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
        ...data,
        published: data.published ?? true
      });
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${data.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error('Blog upsert error:', error);
    return { success: false, error: error.message };
  }
}
