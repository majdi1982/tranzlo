import type {
  User,
  Session,
  TranslatorProfile,
  CompanyProfile,
  Job,
  Application,
  Conversation,
  Message,
  Notification,
  VerificationRequest,
  BlogPost,
  HubPost,
  Complaint,
  Dispute,
  Rating,
} from "@/types";
import type {
  SignupInput,
  LoginInput,
  CreateJobInput,
  ApplyInput,
  SendMessageInput,
  CreateBlogInput,
  CreateHubPostInput,
  ComplaintInput,
  DisputeInput,
  RatingInput,
} from "@/validators";

export interface IAuthService {
  signup(input: SignupInput): Promise<User>;
  login(input: LoginInput): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(userId: string, secret: string, password: string): Promise<void>;
  verifyEmail(userId: string, secret: string): Promise<void>;
  resendVerification(): Promise<void>;
}

export interface IProfileService {
  getTranslatorProfile(userId: string): Promise<TranslatorProfile | null>;
  getCompanyProfile(userId: string): Promise<CompanyProfile | null>;
  updateTranslatorProfile(userId: string, data: Partial<TranslatorProfile>): Promise<TranslatorProfile>;
  updateCompanyProfile(userId: string, data: Partial<CompanyProfile>): Promise<CompanyProfile>;
}

export interface IJobService {
  createJob(data: CreateJobInput & { companyId: string }): Promise<Job>;
  getJob(jobId: string): Promise<Job | null>;
  getJobs(filters?: Record<string, unknown>): Promise<Job[]>;
  updateJob(jobId: string, data: Partial<Job>): Promise<Job>;
  closeJob(jobId: string): Promise<Job>;
  inviteTranslator(jobId: string, translatorId: string): Promise<Job>;
}

export interface IApplicationService {
  apply(data: ApplyInput & { translatorId: string }): Promise<Application>;
  getApplications(jobId: string): Promise<Application[]>;
  getMyApplications(translatorId: string): Promise<Application[]>;
  updateApplicationStatus(
    applicationId: string,
    status: string,
    testStatus?: string,
    testSolutionUrl?: string
  ): Promise<Application>;
  updateApplicationWithFeedback(
    applicationId: string,
    data: { testStatus?: string; testFeedback?: string; status?: string; rejectionReason?: string; testReviewedFileUrl?: string; extensionStatus?: string; extensionReason?: string; extensionRequestedAt?: string; extensionDate?: string; deliveryFileUrl?: string; deliveryDate?: string; escrowStatus?: string; disputeId?: string; revisionStatus?: string; revisionReason?: string; revisionReviewedFileUrl?: string; }
  ): Promise<Application>;
  selectTranslator(jobId: string, selectedAppId: string): Promise<void>;
  getInvitedJobs(translatorId: string): Promise<Job[]>;
  inviteToTest(applicationId: string, jobId: string, companyId: string): Promise<Application>;
}

export interface IMessageService {
  createConversation(participants: string[], jobId?: string, languagePair?: string): Promise<Conversation>;
  getConversations(userId: string): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(data: SendMessageInput): Promise<Message>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
}

export interface INotificationService {
  createNotification(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

export interface IVerificationService {
  submitRequest(userId: string, role: string): Promise<VerificationRequest>;
  getPendingRequests(): Promise<VerificationRequest[]>;
  approveRequest(requestId: string, note?: string): Promise<VerificationRequest>;
  rejectRequest(requestId: string, note: string): Promise<VerificationRequest>;
}

export interface IBlogService {
  createPost(data: CreateBlogInput & { authorId: string }): Promise<BlogPost>;
  getPosts(status?: string): Promise<BlogPost[]>;
  getPost(slug: string): Promise<BlogPost | null>;
  updatePost(postId: string, data: Partial<BlogPost>): Promise<BlogPost>;
  publishPost(postId: string): Promise<BlogPost>;
}

export interface IHubService {
  createPost(data: CreateHubPostInput & { authorId: string }): Promise<HubPost>;
  getPosts(status?: string): Promise<HubPost[]>;
  likePost(postId: string, userId: string): Promise<HubPost>;
  approvePost(postId: string): Promise<HubPost>;
  rejectPost(postId: string): Promise<HubPost>;
}

export interface IComplaintService {
  create(data: ComplaintInput & { userId: string }): Promise<Complaint>;
  getComplaints(userId: string): Promise<Complaint[]>;
  getAllComplaints(): Promise<Complaint[]>;
  reply(complaintId: string, reply: string, resolve?: boolean): Promise<Complaint>;
}

export interface IDisputeService {
  create(data: DisputeInput & { raisedById: string }): Promise<Dispute>;
  getDisputes(jobId?: string): Promise<Dispute[]>;
  getDispute(disputeId: string): Promise<Dispute | null>;
  resolve(
    disputeId: string,
    decision: string,
    note: string
  ): Promise<Dispute>;
  submitEvidence(
    disputeId: string,
    justifications: string,
    evidenceFiles: string[]
  ): Promise<Dispute>;
}

export interface IRatingService {
  create(data: RatingInput & { fromUserId: string }): Promise<Rating>;
  getRatings(userId: string): Promise<Rating[]>;
  getAverageRating(userId: string): Promise<number>;
}
