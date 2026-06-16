import type { ApplicationStatus } from "./common";

export interface Application {
  $id: string;
  jobId: string;
  translatorId: string;
  coverLetter: string;
  cvUrl?: string;
  bidAmount?: number;
  testSolutionUrl?: string;
  testSubmittedAt?: string;
  testStatus?: "none" | "pending" | "passed" | "failed";
  testGradedAt?: string;
  testFeedback?: string;
  languagePair?: string;
  invited?: boolean;
  conversationId?: string;
  testInvitedAt?: string;
  testDeadline?: string;
  rejectionReason?: string;
  testReviewedFileUrl?: string;
  extensionStatus?: "none" | "requested" | "approved" | "rejected";
  extensionReason?: string;
  extensionRequestedAt?: string;
  extensionDate?: string;
  deliveryFileUrl?: string;
  deliveryDate?: string;
  escrowStatus?: "unfunded" | "funded" | "approved" | "released" | "disputed" | "refunded";
  disputeId?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
