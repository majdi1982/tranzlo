import {
  getAccount,
  getDatabases,
  getFunctions,
  DB_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite";
import { generateId, ID } from "@/lib/ids";
import type {
  User,
  Session,
  Job,
  Application,
  Conversation,
  Message,
  Notification,
  TranslatorProfile,
  CompanyProfile,
  BlogPost,
  HubPost,
  Complaint,
  Dispute,
  Rating,
  VerificationRequest,
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

function mapDoc<T>(doc: Record<string, unknown>): T {
  return { $id: doc.$id, ...doc } as unknown as T;
}

const getRedirectUrl = (path: string): string => {
  const base = (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL) || "https://tranzlo.net";
  return `${base.replace(/\/$/, "")}${path}`;
};

export const appwriteAuthService = {
  async signup(input: SignupInput): Promise<User> {
    const account = getAccount();
    const user = await account.create(generateId("user"), input.email, input.password, input.name);
    await account.createEmailPasswordSession(input.email, input.password);
    await account.updatePrefs({ role: input.role });
    
    // Attempt to create email verification. Wrap in try/catch so that if the domain is not yet
    // registered in Appwrite Project Settings -> Platforms, the user is still registered successfully.
    try {
      await account.createVerification(getRedirectUrl("/verify"));
    } catch (err) {
      console.warn("Failed to send verification email (likely redirect URI is not registered in Appwrite Console):", err);
    }

    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      emailVerification: user.emailVerification,
      registration: user.registration as string,
      status: user.status,
      prefs: { role: input.role },
    };
  },

  async login(input: LoginInput): Promise<User> {
    const account = getAccount();
    await account.createEmailPasswordSession(input.email, input.password);
    const user = await account.get();
    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
      emailVerification: user.emailVerification,
      registration: user.registration as string,
      status: user.status,
      prefs: user.prefs as Record<string, unknown>,
    };
  },

  async logout(): Promise<void> {
    const account = getAccount();
    try {
      await account.deleteSession("current");
    } catch {
      // ignore
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const account = getAccount();
      const user = await account.get();
      return {
        $id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
        registration: user.registration as string,
        status: user.status,
        prefs: user.prefs as Record<string, unknown>,
      };
    } catch {
      return null;
    }
  },

  async getSession(): Promise<Session | null> {
    try {
      const account = getAccount();
      const session = await account.getSession("current");
      return {
        $id: session.$id,
        userId: session.userId,
        expire: session.expire,
        provider: session.provider,
      };
    } catch {
      return null;
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const account = getAccount();
    await account.updatePassword(newPassword, currentPassword);
  },

  async updateEmail(email: string, password: string): Promise<void> {
    const account = getAccount();
    await account.updateEmail(email, password);
  },

  async requestPasswordReset(email: string): Promise<void> {
    const account = getAccount();
    await account.createRecovery(email, getRedirectUrl("/reset-password"));
  },

  async resetPassword(userId: string, secret: string, password: string): Promise<void> {
    const account = getAccount();
    await account.updateRecovery(userId, secret, password);
  },

  async verifyEmail(userId: string, secret: string): Promise<void> {
    const account = getAccount();
    await account.updateVerification(userId, secret);
  },

  async resendVerification(): Promise<void> {
    const account = getAccount();
    await account.createVerification(getRedirectUrl("/verify"));
  },
};

export const appwriteProfileService = {
  async getTranslatorProfile(userId: string): Promise<TranslatorProfile | null> {
    try {
      const db = getDatabases();
      const docs = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);
      if (docs.documents.length === 0) return null;
      return mapDoc<TranslatorProfile>(docs.documents[0] as Record<string, unknown>);
    } catch {
      return null;
    }
  },

  async getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
    try {
      const db = getDatabases();
      const docs = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);
      if (docs.documents.length === 0) return null;
      return mapDoc<CompanyProfile>(docs.documents[0] as Record<string, unknown>);
    } catch {
      return null;
    }
  },

  async updateTranslatorProfile(userId: string, data: Partial<TranslatorProfile>): Promise<TranslatorProfile> {
    const db = getDatabases();
    const existing = await appwriteProfileService.getTranslatorProfile(userId);
    if (existing) {
      const updated = await db.updateDocument(DB_ID, COLLECTIONS.translatorProfiles, existing.$id, data);
      return mapDoc<TranslatorProfile>(updated as Record<string, unknown>);
    }
    const created = await db.createDocument(DB_ID, COLLECTIONS.translatorProfiles, generateId("translator"), { ...data, userId });
    return mapDoc<TranslatorProfile>(created as Record<string, unknown>);
  },

  async updateCompanyProfile(userId: string, data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const db = getDatabases();
    const existing = await appwriteProfileService.getCompanyProfile(userId);
    if (existing) {
      const updated = await db.updateDocument(DB_ID, COLLECTIONS.companyProfiles, existing.$id, data);
      return mapDoc<CompanyProfile>(updated as Record<string, unknown>);
    }
    const created = await db.createDocument(DB_ID, COLLECTIONS.companyProfiles, generateId("company"), { ...data, userId });
    return mapDoc<CompanyProfile>(created as Record<string, unknown>);
  },

  async listPublicTranslators(): Promise<TranslatorProfile[]> {
    try {
      const db = getDatabases();
      const docs = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
        Query.equal("isPublicPlatform", true),
        Query.equal("onboardingComplete", true),
        Query.limit(100),
      ]);
      return docs.documents.map((d) => mapDoc<TranslatorProfile>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async listPublicCompanies(): Promise<CompanyProfile[]> {
    try {
      const db = getDatabases();
      const docs = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [
        Query.equal("isPublicPlatform", true),
        Query.equal("onboardingComplete", true),
        Query.limit(100),
      ]);
      return docs.documents.map((d) => mapDoc<CompanyProfile>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },
};

export const appwriteJobService = {
  async createJob(data: CreateJobInput & { companyId: string }): Promise<Job> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.jobs, generateId("job"), {
      ...data,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<Job>(doc as Record<string, unknown>);
  },

  async getJob(jobId: string): Promise<Job | null> {
    try {
      const db = getDatabases();
      const doc = await db.getDocument(DB_ID, COLLECTIONS.jobs, jobId);
      return mapDoc<Job>(doc as Record<string, unknown>);
    } catch {
      return null;
    }
  },

  async getJobs(filters?: Record<string, unknown>): Promise<Job[]> {
    const db = getDatabases();
    const queries: string[] = [];
    if (filters?.status) queries.push(Query.equal("status", filters.status as string));
    if (filters?.sourceLanguage) queries.push(Query.equal("sourceLanguage", filters.sourceLanguage as string));
    if (filters?.targetLanguage) queries.push(Query.equal("targetLanguage", filters.targetLanguage as string));
    if (filters?.companyId) queries.push(Query.equal("companyId", filters.companyId as string));
    queries.push(Query.orderDesc("createdAt"));
    const result = await db.listDocuments(DB_ID, COLLECTIONS.jobs, queries);
    return result.documents.map((d) => mapDoc<Job>(d as Record<string, unknown>));
  },

  async updateJob(jobId: string, data: Partial<Job>): Promise<Job> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.jobs, jobId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<Job>(doc as Record<string, unknown>);
  },

  async closeJob(jobId: string): Promise<Job> {
    return appwriteJobService.updateJob(jobId, { status: "closed" });
  },
};

export const appwriteApplicationService = {
  async apply(data: ApplyInput & { translatorId: string }): Promise<Application> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.applications, generateId("application"), {
      ...data,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<Application>(doc as Record<string, unknown>);
  },

  async getApplications(jobId: string): Promise<Application[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
      Query.equal("jobId", jobId),
    ]);
    return result.documents.map((d) => mapDoc<Application>(d as Record<string, unknown>));
  },

  async getMyApplications(translatorId: string): Promise<Application[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
      Query.equal("translatorId", translatorId),
    ]);
    return result.documents.map((d) => mapDoc<Application>(d as Record<string, unknown>));
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<Application> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.applications, applicationId, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<Application>(doc as Record<string, unknown>);
  },
};

export const appwriteMessageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.conversations, [
      Query.search("participants", userId),
    ]);
    return result.documents.map((d) => mapDoc<Conversation>(d as Record<string, unknown>));
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.messages, [
      Query.equal("conversationId", conversationId),
      Query.orderAsc("createdAt"),
    ]);
    return result.documents.map((d) => mapDoc<Message>(d as Record<string, unknown>));
  },

  async sendMessage(data: SendMessageInput & { senderId: string }): Promise<Message> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.messages, generateId("message"), {
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return mapDoc<Message>(doc as Record<string, unknown>);
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const db = getDatabases();
    const messages = await db.listDocuments(DB_ID, COLLECTIONS.messages, [
      Query.equal("conversationId", conversationId),
      Query.notEqual("senderId", userId),
      Query.equal("read", false),
    ]);
    for (const msg of messages.documents) {
      await db.updateDocument(DB_ID, COLLECTIONS.messages, msg.$id, { read: true });
    }
  },
};

export const appwriteNotificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.notifications, [
      Query.equal("userId", userId),
      Query.orderDesc("createdAt"),
    ]);
    return result.documents.map((d) => mapDoc<Notification>(d as Record<string, unknown>));
  },

  async markAsRead(notificationId: string): Promise<void> {
    const db = getDatabases();
    await db.updateDocument(DB_ID, COLLECTIONS.notifications, notificationId, { read: true });
  },

  async getUnreadCount(userId: string): Promise<number> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.notifications, [
      Query.equal("userId", userId),
      Query.equal("read", false),
      Query.limit(1),
    ]);
    return result.total;
  },
};

export const appwriteVerificationService = {
  async submitRequest(userId: string, role: string): Promise<VerificationRequest> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.verificationRequests, generateId("verificationRequest"), {
      userId,
      role,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<VerificationRequest>(doc as Record<string, unknown>);
  },

  async getPendingRequests(): Promise<VerificationRequest[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.verificationRequests, [
      Query.equal("status", "pending"),
    ]);
    return result.documents.map((d) => mapDoc<VerificationRequest>(d as Record<string, unknown>));
  },

  async approveRequest(requestId: string, note?: string): Promise<VerificationRequest> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.verificationRequests, requestId, {
      status: "verified",
      adminNote: note || "",
      reviewedAt: new Date().toISOString(),
    });
    return mapDoc<VerificationRequest>(doc as Record<string, unknown>);
  },

  async rejectRequest(requestId: string, note: string): Promise<VerificationRequest> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.verificationRequests, requestId, {
      status: "rejected",
      adminNote: note,
      reviewedAt: new Date().toISOString(),
    });
    return mapDoc<VerificationRequest>(doc as Record<string, unknown>);
  },
};

export const appwriteBlogService = {
  async createPost(data: CreateBlogInput & { authorId: string }): Promise<BlogPost> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.blogPosts, generateId("blogPost"), {
      ...data,
      authorId: data.authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<BlogPost>(doc as Record<string, unknown>);
  },

  async getPosts(status?: string): Promise<BlogPost[]> {
    const db = getDatabases();
    const queries: string[] = [];
    if (status) queries.push(Query.equal("status", status));
    queries.push(Query.orderDesc("createdAt"));
    const result = await db.listDocuments(DB_ID, COLLECTIONS.blogPosts, queries);
    return result.documents.map((d) => mapDoc<BlogPost>(d as Record<string, unknown>));
  },

  async getPost(slug: string): Promise<BlogPost | null> {
    try {
      const db = getDatabases();
      const result = await db.listDocuments(DB_ID, COLLECTIONS.blogPosts, [
        Query.equal("slug", slug),
        Query.limit(1),
      ]);
      if (result.documents.length === 0) return null;
      return mapDoc<BlogPost>(result.documents[0] as Record<string, unknown>);
    } catch {
      return null;
    }
  },

  async updatePost(postId: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.blogPosts, postId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<BlogPost>(doc as Record<string, unknown>);
  },

  async publishPost(postId: string): Promise<BlogPost> {
    return appwriteBlogService.updatePost(postId, {
      status: "published",
      publishedAt: new Date().toISOString(),
    } as Partial<BlogPost>);
  },
};

export const appwriteHubService = {
  async createPost(data: CreateHubPostInput & { authorId: string }): Promise<HubPost> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.hubPosts, generateId("hubPost"), {
      ...data,
      authorId: data.authorId,
      likes: [],
      status: "pending_review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<HubPost>(doc as Record<string, unknown>);
  },

  async getPosts(status?: string): Promise<HubPost[]> {
    const db = getDatabases();
    const queries: string[] = [];
    if (status) queries.push(Query.equal("status", status));
    queries.push(Query.orderDesc("createdAt"));
    const result = await db.listDocuments(DB_ID, COLLECTIONS.hubPosts, queries);
    return result.documents.map((d) => mapDoc<HubPost>(d as Record<string, unknown>));
  },

  async likePost(postId: string, userId: string): Promise<HubPost> {
    const db = getDatabases();
    const post = await db.getDocument(DB_ID, COLLECTIONS.hubPosts, postId);
    const likes = (post.likes as string[]) || [];
    const idx = likes.indexOf(userId);
    if (idx > -1) likes.splice(idx, 1);
    else likes.push(userId);
    const updated = await db.updateDocument(DB_ID, COLLECTIONS.hubPosts, postId, { likes });
    return mapDoc<HubPost>(updated as Record<string, unknown>);
  },

  async approvePost(postId: string): Promise<HubPost> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.hubPosts, postId, {
      status: "published",
    });
    return mapDoc<HubPost>(doc as Record<string, unknown>);
  },

  async rejectPost(postId: string): Promise<HubPost> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.hubPosts, postId, {
      status: "rejected",
    });
    return mapDoc<HubPost>(doc as Record<string, unknown>);
  },
};

export const appwriteComplaintService = {
  async create(data: ComplaintInput & { userId: string }): Promise<Complaint> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.complaints, generateId("complaint"), {
      ...data,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<Complaint>(doc as Record<string, unknown>);
  },

  async getComplaints(userId: string): Promise<Complaint[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.complaints, [
      Query.equal("userId", userId),
    ]);
    return result.documents.map((d) => mapDoc<Complaint>(d as Record<string, unknown>));
  },

  async getAllComplaints(): Promise<Complaint[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.complaints);
    return result.documents.map((d) => mapDoc<Complaint>(d as Record<string, unknown>));
  },

  async reply(complaintId: string, reply: string, resolve?: boolean): Promise<Complaint> {
    const db = getDatabases();
    const data: Record<string, unknown> = { adminReply: reply, updatedAt: new Date().toISOString() };
    if (resolve) data.status = "resolved";
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.complaints, complaintId, data);
    return mapDoc<Complaint>(doc as Record<string, unknown>);
  },
};

export const appwriteDisputeService = {
  async create(data: DisputeInput & { raisedById: string }): Promise<Dispute> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.disputes, generateId("dispute"), {
      ...data,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return mapDoc<Dispute>(doc as Record<string, unknown>);
  },

  async getDisputes(jobId?: string): Promise<Dispute[]> {
    const db = getDatabases();
    const queries: string[] = [];
    if (jobId) queries.push(Query.equal("jobId", jobId));
    const result = await db.listDocuments(DB_ID, COLLECTIONS.disputes, queries);
    return result.documents.map((d) => mapDoc<Dispute>(d as Record<string, unknown>));
  },

  async resolve(disputeId: string, decision: string, note: string): Promise<Dispute> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.disputes, disputeId, {
      status: "resolved",
      decision,
      adminDecisionNote: note,
      resolvedAt: new Date().toISOString(),
    });
    return mapDoc<Dispute>(doc as Record<string, unknown>);
  },
};

export const appwriteRatingService = {
  async create(data: RatingInput & { fromUserId: string }): Promise<Rating> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.ratings, generateId("rating"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return mapDoc<Rating>(doc as Record<string, unknown>);
  },

  async getRatings(userId: string): Promise<Rating[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.ratings, [
      Query.equal("toUserId", userId),
    ]);
    return result.documents.map((d) => mapDoc<Rating>(d as Record<string, unknown>));
  },

  async getAverageRating(userId: string): Promise<number> {
    const ratings = await appwriteRatingService.getRatings(userId);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
  },
};
