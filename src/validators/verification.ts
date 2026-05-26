import { z } from "zod";

export const verificationRequestSchema = z.object({
  role: z.enum(["translator", "company"]),
});

export const adminVerificationActionSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
});

export type VerificationRequestInput = z.infer<typeof verificationRequestSchema>;
export type AdminVerificationAction = z.infer<typeof adminVerificationActionSchema>;
