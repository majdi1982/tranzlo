import type { JobStatus } from "./common";

export interface Job {
  $id: string;
  companyId: string;
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  country?: string;
  workType: "onsite" | "online";
  budget: number;
  deadline: string;
  specializations: string[];
  services: string; // JSON: { serviceId: string; quantity: number; unit: string; rate?: number }[]
  requiredCatTools?: string[];
  requiresTest: boolean;
  reviewerType: "company" | "translator";
  activeTranslatorId?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilter {
  sourceLanguage?: string;
  targetLanguage?: string;
  country?: string;
  specializations?: string[];
  budgetMin?: number;
  budgetMax?: number;
  verifiedOnly?: boolean;
  remote?: boolean;
  sort?: "newest" | "budget" | "deadline";
}
