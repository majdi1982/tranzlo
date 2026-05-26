import { z } from "zod";

export const applySchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters"),
});

export type ApplyInput = z.infer<typeof applySchema>;
