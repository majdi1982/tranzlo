import type { Role, VerificationStatus, EntityStatus } from "./common";

export interface BaseProfile {
  $id: string;
  userId: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  planTier: string;
  trialEndsAt?: string;
  trialStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranslatorProfile extends BaseProfile {
  role: "translator";
  fullName: string;
  bio?: string;
  languages: string[];
  specializations: string[];
  hourlyRate?: number;
  completedJobs: number;
  rating: number;
  ratingCount: number;
  cvUrl?: string;
  isApproved: boolean;
  status: EntityStatus;
}

export interface CompanyProfile extends BaseProfile {
  role: "company";
  companyName: string;
  fullName: string;
  contactPerson: string;
  registrationDoc?: string;
  taxDoc?: string;
  logoUrl?: string;
  isApproved: boolean;
  status: EntityStatus;
}
