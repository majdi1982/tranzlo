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
  rejectionReason?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
