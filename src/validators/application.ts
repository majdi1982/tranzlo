import { z } from "zod";

export const applySchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters"),
  bidAmount: z.number().positive("Bid amount must be positive").optional(),
  languagePair: z.string().optional(),
  testSolutionUrl: z.string().optional(),
  testStatus: z.string().optional(),
  testSubmittedAt: z.string().optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;
