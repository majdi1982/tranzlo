import { z } from "zod";

export const createHubPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
});

export const createHubCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty"),
});

export type CreateHubPostInput = z.infer<typeof createHubPostSchema>;
export type CreateHubCommentInput = z.infer<typeof createHubCommentSchema>;
