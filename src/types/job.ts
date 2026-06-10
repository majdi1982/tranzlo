import type { JobStatus } from "./common";

export interface Job {
  $id: string;
  companyId: string;
  title: string;
  description: string;
  jobType: "translation" | "proofreading" | "localization" | "transcription" | "subtitling";
  sourceLanguage: string;
  targetLanguage: string;
  country?: string;
  workType?: "onsite" | "online" | "hybrid";
  duration?: number;
  wordCount?: number;
  industry?: string;
  budget: number;
  budgetMin?: number;
  budgetMax?: number;
  deadline: string;
  specializations: string[];
  services: string; // JSON: { serviceId: string; quantity: number; unit: string; rate?: number }[]
  requiredCatTools?: string[];
  requiresTest: boolean;
  testFileUrl?: string;
  testDuration?: number;
  testWordCount?: number;
  maxTestApplicants?: number;
  maxHires?: number;
  maxApplicants?: number;
  invitedTranslators?: string[];
  testDistributedAt?: string;
  testDeadline?: string;
  reviewerType: "company" | "translator";
  activeTranslatorId?: string;
  externalTranslatorEmail?: string;
  previousTranslatorId?: string;
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
