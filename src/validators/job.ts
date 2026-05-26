import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  sourceLanguage: z.string().min(1, "Source language is required"),
  targetLanguage: z.string().min(1, "Target language is required"),
  country: z.string().min(1, "Country is required"),
  remote: z.boolean().default(true),
  budget: z.number().positive("Budget must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
  specialization: z.string().min(1, "Specialization is required"),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
