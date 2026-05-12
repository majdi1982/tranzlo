export type UserRole = "translator" | "company" | "agency" | "admin";

export type JobStatus = "draft" | "published" | "in_progress" | "completed" | "cancelled";
export type ApplicationStatus = "applied" | "shortlisted" | "rejected" | "hired";

export interface UserProfile {
  $id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  languages?: string[]; // e.g. ["en", "ar"]
  rating?: number;
  verified?: boolean;
  createdAt: string;
}

export interface Job {
  $id: string;
  companyId: string;
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  budget: number;
  deadline: string;
  status: JobStatus;
  hiredTranslatorId?: string;
  createdAt: string;
}

export interface Application {
  $id: string;
  jobId: string;
  translatorId: string;
  proposalText: string;
  price: number;
  deliveryTime: string; // e.g. "5 days"
  status: ApplicationStatus;
  createdAt: string;
}

export interface ChatRoom {
  $id: string;
  jobId: string;
  participants: string[];
  createdAt: string;
}

export interface Message {
  $id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  type: "text" | "system";
  createdAt: string;
}

export interface FileMetadata {
  $id: string;
  jobId: string;
  uploaderId: string;
  fileUrl: string;
  fileName: string;
  version: number;
  createdAt: string;
}

export interface Invitation {
  $id: string;
  jobId: string;
  companyId: string;
  translatorId: string;
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface Review {
  $id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface KYCData {
  $id: string;
  userId: string;
  documentType: "passport" | "id_card" | "driver_license";
  documentUrl: string;
  status: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface Notification {
  $id: string;
  userId: string;
  type: "message" | "file" | "status" | "hired" | "invitation" | "review";
  content: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Dispute {
  $id: string;
  jobId: string;
  openedBy: string;
  reason: string;
  status: "open" | "under_review" | "resolved";
  createdAt: string;
}
