import { z } from "zod";

export const ratingSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  toUserId: z.string().min(1, "Recipient ID is required"),
  stars: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  reviewText: z.string().max(500, "Review must be under 500 characters").optional(),
});

export type RatingInput = z.infer<typeof ratingSchema>;
