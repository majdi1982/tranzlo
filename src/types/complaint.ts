import type { ComplaintStatus } from "./common";

export interface Complaint {
  $id: string;
  userId: string;
  subject: string;
  description: string;
  adminReply?: string;
  status: ComplaintStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
