import { z } from "zod";

const pricingEntrySchema = z.object({
  serviceId: z.string(),
  rate: z.number().positive(),
  unit: z.string(),
  minCharge: z.number().nonnegative().optional(),
});

export const translatorProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(1000, "Bio must be under 1000 characters").optional(),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  languagePairs: z
    .array(
      z.object({
        source: z.string(),
        target: z.string(),
        level: z.enum(["beginner", "intermediate", "advanced", "native"]),
      })
    )
    .optional(),
  specializations: z.array(z.string()).optional(),
  catTools: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  pricing: z.array(pricingEntrySchema).optional(),
  phone: z.string().optional(),
  certificates: z.array(z.string()).optional(),
  linkedIn: z.string().url().optional().or(z.literal("")),
  yearsOfExperience: z.number().nonnegative().optional(),
});

export const companyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().min(2, "Contact person is required"),
  phone: z.string().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "200+"]).optional(),
  website: z.string().url().optional().or(z.literal("")),
  about: z.string().max(2000).optional(),
});

export type TranslatorProfileInput = z.infer<typeof translatorProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type PricingEntry = z.infer<typeof pricingEntrySchema>;
