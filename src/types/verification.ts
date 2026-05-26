import type { VerificationStatus } from "./common";

export interface VerificationRequest {
  $id: string;
  userId: string;
  role: "translator" | "company";
  status: VerificationStatus;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDocument {
  $id: string;
  requestId: string;
  userId: string;
  type: "id" | "certificate" | "cv" | "registration" | "tax" | "other";
  fileUrl: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
