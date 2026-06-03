import type { BlogPostStatus } from "./common";

export interface BlogPost {
  $id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  category?: string;
  imageAlt?: string;
  status: BlogPostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDraft {
  title?: string;
  excerpt?: string;
  content?: string;
  generatedBy?: "ai" | "news" | "manual";
}
