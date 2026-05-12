export type UserRole = "translator" | "company" | "agency" | "admin";

export type JobStatus = "active" | "inactive" | "pending" | "reviewing" | "completed" | "archived" | "cancelled" | "suspended";
export type JobType = "fixed" | "hourly" | "milestone";
export type ApplicationStatus = "pending" | "reviewing" | "completed" | "cancelled" | "active";
export type AuditAction = "create" | "update" | "delete" | "status_change" | "hire" | "apply" | "login" | "payment";

export interface GlobalFields {
  publicId: string;
  entityType: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  status: string;
  visibility: "public" | "private" | "internal";
  metadata?: string; // JSON string
}

export interface UserProfile extends GlobalFields {
  $id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  languages?: string[];
  rating?: number;
  verified?: boolean;
}

export interface Job extends GlobalFields {
  $id: string;
  companyId: string;
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  budget: number;
  deadline: string;
  jobType: JobType;
  isInviteOnly: boolean;
  applicationCount?: number;
  viewCount?: number;
  milestones?: string; // JSON string
  hiredTranslatorId?: string;
}

export interface Application extends GlobalFields {
  $id: string;
  jobId: string;
  translatorId: string;
  proposalText: string;
  price: number;
  deliveryTime: string;
}

export interface AuditLog extends GlobalFields {
  $id: string;
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  changes?: string; // JSON string
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
