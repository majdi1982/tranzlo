import { z } from "zod";
import { BLOG_CATEGORY_SLUGS } from "@/constants/categories";

export const createBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case").optional(),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.enum(BLOG_CATEGORY_SLUGS as [string, ...string[]]).optional(),
  primaryKeyword: z.string().optional(),
  wordCount: z.number().positive().optional(),
  readingTime: z.number().positive().optional(),
  generatedBy: z.enum(["ai", "news", "manual"]).optional(),
  imageAlt: z.string().optional(),
  status: z.enum(["draft", "scheduled", "pending_review", "published", "rejected"]).default("draft"),
  scheduledAt: z.string().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
