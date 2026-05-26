import type { JobStatus } from "./common";

export interface Job {
  $id: string;
  companyId: string;
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  country: string;
  remote: boolean;
  budget: number;
  deadline: string;
  specialization: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilter {
  sourceLanguage?: string;
  targetLanguage?: string;
  country?: string;
  specialization?: string;
  budgetMin?: number;
  budgetMax?: number;
  verifiedOnly?: boolean;
  remote?: boolean;
  sort?: "newest" | "budget" | "deadline";
}
