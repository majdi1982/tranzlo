import type { DisputeStatus } from "./common";

export interface Dispute {
  $id: string;
  jobId: string;
  raisedById: string;
  reason: string;
  adminDecisionNote?: string;
  decision?: "release" | "refund" | "dismiss";
  status: DisputeStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
