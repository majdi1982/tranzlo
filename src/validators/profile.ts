import { z } from "zod";

export const translatorProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  specializations: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  phone: z.string().optional(),
});

export const companyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().min(2, "Contact person is required"),
  phone: z.string().optional(),
});

export type TranslatorProfileInput = z.infer<typeof translatorProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
