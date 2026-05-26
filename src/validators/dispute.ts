import { z } from "zod";

export const disputeSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  reason: z.string().min(20, "Reason must be at least 20 characters"),
});

export const adminDisputeResolutionSchema = z.object({
  disputeId: z.string().min(1),
  decision: z.enum(["release", "refund", "dismiss"]),
  note: z.string().min(1, "Decision note is required"),
});

export type DisputeInput = z.infer<typeof disputeSchema>;
export type AdminDisputeResolution = z.infer<typeof adminDisputeResolutionSchema>;
