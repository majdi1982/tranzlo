import { z } from "zod";

const serviceEntrySchema = z.object({
  serviceId: z.string(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string(),
  rate: z.number().positive().optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  sourceLanguage: z.string().min(1, "Source language is required"),
  targetLanguage: z.string().min(1, "Target language is required"),
  country: z.string().optional(),
  workType: z.enum(["onsite", "online", "hybrid"]),
  budget: z.number().positive("Budget must be positive"),
  budgetMin: z.number().positive("Minimum budget must be positive").optional(),
  budgetMax: z.number().positive("Maximum budget must be positive").optional(),
  deadline: z.string().min(1, "Deadline is required"),
  specializations: z.array(z.string()).min(1, "At least one specialization is required"),
  services: z.array(serviceEntrySchema).min(1, "At least one service is required"),
  requiredCatTools: z.array(z.string()).optional(),
  requiresTest: z.boolean().default(false),
  testFileUrl: z.string().optional(),
  testDuration: z.number().positive("Duration must be positive").optional(),
  testWordCount: z.number().positive("Word count must be positive").max(250, "Word count must be at most 250 words").optional(),
  maxTestApplicants: z.number().positive("Maximum test applicants must be positive").optional(),
  maxHires: z.number().positive("Maximum hires must be positive").optional(),
  reviewerType: z.enum(["company", "translator"]),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ServiceEntry = z.infer<typeof serviceEntrySchema>;
