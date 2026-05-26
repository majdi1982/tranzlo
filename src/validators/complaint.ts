import { z } from "zod";

export const complaintSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export const adminComplaintReplySchema = z.object({
  complaintId: z.string().min(1),
  reply: z.string().min(1, "Reply is required"),
  resolve: z.boolean().default(false),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;
export type AdminComplaintReply = z.infer<typeof adminComplaintReplySchema>;
