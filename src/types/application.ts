import type { ApplicationStatus } from "./common";

export interface Application {
  $id: string;
  jobId: string;
  translatorId: string;
  coverLetter: string;
  cvUrl?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
