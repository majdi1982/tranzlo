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
  paypalSubscriptionId?: string;
  paypalEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranslatorProfile extends BaseProfile {
  role: "translator";
  fullName: string;
  bio?: string;
  languages: string[];
  nativeLanguage?: string;
  languagePairs?: { source: string; target: string; level: "beginner" | "intermediate" | "advanced" | "native" }[];
  specializations: string[];
  catTools?: string[];
  hourlyRate?: number;
  pricing?: string; // JSON stringified: { serviceId: string; rate: number; unit: string; minCharge?: number }[]
  completedJobs: number;
  rating: number;
  ratingCount: number;
  cvUrl?: string;
  certificates?: string[];
  nationalIdUrl?: string;
  languageCertificates?: string; // JSON: {pairId: string; pairLabel: string; certUrl: string}[]
  linkedIn?: string;
  yearsOfExperience?: number;
  isApproved: boolean;
  status: EntityStatus;
  onboardingStep?: number;
  onboardingComplete?: boolean;
  isPublicPlatform?: boolean;
  searchEngines?: string[];
  seoKeywords?: string;
}

export interface CompanyProfile extends BaseProfile {
  role: "company";
  companyName: string;
  fullName: string;
  contactPerson: string;
  registrationDoc?: string;
  taxDoc?: string;
  founderIdUrl?: string;
  brochureUrl?: string;
  logoUrl?: string;
  companySize?: string;
  website?: string;
  about?: string;
  isApproved: boolean;
  status: EntityStatus;
  onboardingStep?: number;
  onboardingComplete?: boolean;
  isPublicPlatform?: boolean;
  searchEngines?: string[];
  seoKeywords?: string;
}
