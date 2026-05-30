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
import {
  mockTranslatorProfiles,
  mockCompanyProfiles,
  mockJobs,
  mockApplications,
  mockConversations,
  mockMessages,
  mockNotifications,
  mockBlogPosts,
  mockHubPosts,
  mockComplaints,
  mockDisputes,
  mockRatings,
  getMockProfileByEmail,
  getMockProfileByUserId,
} from "@/data/mock";

let currentMockUser: User | null = null;
let currentMockSession: Session | null = null;

const MOCK_PASSWORD = "password123";

export const mockAuthService = {
  async signup(input: { email: string; password: string; name: string; role: string }): Promise<User> {
    const existing = getMockProfileByEmail(input.email);
    if (existing) throw new Error("Email already registered");

    const userId = `mock_user_${Date.now()}`;

    const user: User = {
      $id: userId,
      email: input.email,
      name: input.name,
      emailVerification: false,
      registration: new Date().toISOString(),
      status: true,
      prefs: { role: input.role },
    };

    if (input.role === "translator") {
      const profile: TranslatorProfile = {
        $id: `mock_tp_${Date.now()}`,
        userId,
        email: input.email,
        role: "translator",
        fullName: input.name,
        bio: "",
        languages: [],
        specializations: [],
        hourlyRate: 0,
        avatarUrl: "",
        phone: "",
        isVerified: false,
        verificationStatus: "unverified",
        completedJobs: 0,
        rating: 0,
        ratingCount: 0,
        cvUrl: "",
        isApproved: false,
        status: "active",
        planTier: "free",
        trialEndsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        trialStatus: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTranslatorProfiles.push(profile);
    } else {
      const profile: CompanyProfile = {
        $id: `mock_cp_${Date.now()}`,
        userId,
        email: input.email,
        role: "company",
        companyName: input.name,
        fullName: input.name,
        contactPerson: input.name,
        logoUrl: "",
        avatarUrl: "",
        phone: "",
        isVerified: false,
        verificationStatus: "unverified",
        planTier: "free",
        trialEndsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        trialStatus: "active",
        isApproved: false,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCompanyProfiles.push(profile);
    }

    currentMockUser = user;
    currentMockSession = { $id: "mock_session", userId: user.$id, expire: "", provider: "email" };
    return user;
  },

  async login(input: { email: string; password: string }): Promise<User> {
    if (input.password !== MOCK_PASSWORD && !input.password.startsWith("mock")) {
      throw new Error("Invalid email or password");
    }
    const profile = getMockProfileByEmail(input.email);
    if (!profile) throw new Error("Invalid email or password");
    const user: User = {
      $id: profile.userId,
      email: profile.email,
      name: "fullName" in profile ? (profile as TranslatorProfile).fullName : (profile as CompanyProfile).companyName,
      emailVerification: true,
      registration: "",
      status: true,
      prefs: { role: profile.role },
    };
    currentMockUser = user;
    currentMockSession = { $id: "mock_session", userId: user.$id, expire: "", provider: "email" };
    return user;
  },

  async logout(): Promise<void> {
    currentMockUser = null;
    currentMockSession = null;
  },

  async getCurrentUser(): Promise<User | null> {
    return currentMockUser;
  },

  async getSession(): Promise<Session | null> {
    return currentMockSession;
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!currentMockUser) throw new Error("Not authenticated");
    return;
  },

  async requestPasswordReset(email: string): Promise<void> {
    const profile = getMockProfileByEmail(email);
    if (!profile) throw new Error("No account found with this email");
    return;
  },

  async resetPassword(userId: string, secret: string, password: string): Promise<void> {
    return;
  },

  async verifyEmail(userId: string, secret: string): Promise<void> {
    if (currentMockUser && currentMockUser.$id === userId) {
      currentMockUser.emailVerification = true;
    }
  },

  async resendVerification(): Promise<void> {
    return;
  },
};

export const mockProfileService = {
  async getTranslatorProfile(userId: string): Promise<TranslatorProfile | null> {
    return mockTranslatorProfiles.find((p) => p.userId === userId) || null;
  },

  async getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
    return mockCompanyProfiles.find((p) => p.userId === userId) || null;
  },

  async updateTranslatorProfile(userId: string, data: Partial<TranslatorProfile>): Promise<TranslatorProfile> {
    const profile = await mockProfileService.getTranslatorProfile(userId);
    if (!profile) throw new Error("Profile not found");
    Object.assign(profile, data);
    return profile;
  },

  async updateCompanyProfile(userId: string, data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const profile = await mockProfileService.getCompanyProfile(userId);
    if (!profile) throw new Error("Profile not found");
    Object.assign(profile, data);
    return profile;
  },
};

export const mockJobService = {
  async createJob(data: any): Promise<Job> {
    const job: Job = {
      $id: `mock_job_${Date.now()}`,
      companyId: data.companyId,
      title: data.title,
      description: data.description,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      country: data.country,
      workType: data.workType ?? "online",
      budget: data.budget,
      deadline: data.deadline,
      specializations: data.specializations ?? [],
      services: data.services ?? [],
      requiredCatTools: data.requiredCatTools ?? [],
      requiresTest: data.requiresTest ?? false,
      reviewerType: data.reviewerType ?? "company",
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockJobs.unshift(job);
    return job;
  },

  async getJob(jobId: string): Promise<Job | null> {
    return mockJobs.find((j) => j.$id === jobId) || null;
  },

  async getJobs(filters?: Record<string, unknown>): Promise<Job[]> {
    let result = [...mockJobs];
    if (filters?.status) result = result.filter((j) => j.status === filters.status);
    if (filters?.sourceLanguage) result = result.filter((j) => j.sourceLanguage === filters.sourceLanguage);
    if (filters?.targetLanguage) result = result.filter((j) => j.targetLanguage === filters.targetLanguage);
    if (filters?.companyId) result = result.filter((j) => j.companyId === filters.companyId);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async updateJob(jobId: string, data: Partial<Job>): Promise<Job> {
    const job = mockJobs.find((j) => j.$id === jobId);
    if (!job) throw new Error("Job not found");
    Object.assign(job, data);
    return job;
  },

  async closeJob(jobId: string): Promise<Job> {
    return mockJobService.updateJob(jobId, { status: "closed" });
  },
};

export const mockApplicationService = {
  async apply(data: any): Promise<Application> {
    const app: Application = {
      $id: `mock_app_${Date.now()}`,
      jobId: data.jobId,
      translatorId: data.translatorId,
      coverLetter: data.coverLetter,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockApplications.unshift(app);
    return app;
  },

  async getApplications(jobId: string): Promise<Application[]> {
    return mockApplications.filter((a) => a.jobId === jobId);
  },

  async getMyApplications(translatorId: string): Promise<Application[]> {
    return mockApplications.filter((a) => a.translatorId === translatorId);
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<Application> {
    const app = mockApplications.find((a) => a.$id === applicationId);
    if (!app) throw new Error("Application not found");
    app.status = status as any;
    app.updatedAt = new Date().toISOString();
    return app;
  },
};

export const mockMessageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    return mockConversations.filter((c) => c.participants.includes(userId));
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return mockMessages.filter((m) => m.conversationId === conversationId);
  },

  async sendMessage(data: any): Promise<Message> {
    const msg: Message = {
      $id: `mock_msg_${Date.now()}`,
      conversationId: data.conversationId,
      senderId: data.senderId || currentMockUser?.$id || "",
      content: data.content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    mockMessages.push(msg);
    return msg;
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    mockMessages
      .filter((m) => m.conversationId === conversationId && m.senderId !== userId)
      .forEach((m) => (m.read = true));
  },
};

export const mockNotificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    return mockNotifications.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async markAsRead(notificationId: string): Promise<void> {
    const notif = mockNotifications.find((n) => n.$id === notificationId);
    if (notif) notif.read = true;
  },

  async getUnreadCount(userId: string): Promise<number> {
    return mockNotifications.filter((n) => n.userId === userId && !n.read).length;
  },
};

export const mockBlogService = {
  async createPost(data: any): Promise<BlogPost> {
    const post: BlogPost = {
      $id: `mock_blog_${Date.now()}`,
      authorId: data.authorId,
      title: data.title,
      slug: data.title.toLowerCase().replace(/\s+/g, "-"),
      excerpt: data.excerpt,
      content: data.content,
      tags: data.tags || [],
      status: data.status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBlogPosts.unshift(post);
    return post;
  },

  async getPosts(status?: string): Promise<BlogPost[]> {
    let result = [...mockBlogPosts];
    if (status) result = result.filter((p) => p.status === status);
    return result;
  },

  async getPost(slug: string): Promise<BlogPost | null> {
    return mockBlogPosts.find((p) => p.slug === slug) || null;
  },

  async updatePost(postId: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const post = mockBlogPosts.find((p) => p.$id === postId);
    if (!post) throw new Error("Post not found");
    Object.assign(post, data);
    return post;
  },

  async publishPost(postId: string): Promise<BlogPost> {
    return mockBlogService.updatePost(postId, {
      status: "published",
      publishedAt: new Date().toISOString(),
    });
  },
};

export const mockHubService = {
  async createPost(data: any): Promise<HubPost> {
    const post: HubPost = {
      $id: `mock_hub_${Date.now()}`,
      authorId: data.authorId,
      title: data.title,
      content: data.content,
      category: data.category,
      likes: [],
      status: "pending_review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockHubPosts.unshift(post);
    return post;
  },

  async getPosts(status?: string): Promise<HubPost[]> {
    let result = [...mockHubPosts];
    if (status) result = result.filter((p) => p.status === status);
    return result;
  },

  async likePost(postId: string, userId: string): Promise<HubPost> {
    const post = mockHubPosts.find((p) => p.$id === postId);
    if (!post) throw new Error("Post not found");
    const idx = post.likes.indexOf(userId);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(userId);
    return post;
  },

  async approvePost(postId: string): Promise<HubPost> {
    return mockHubService.createPost.length
      ? (mockHubPosts.find((p) => p.$id === postId) as HubPost)
      : ({} as HubPost);
  },

  async rejectPost(postId: string): Promise<HubPost> {
    const post = mockHubPosts.find((p) => p.$id === postId);
    if (!post) throw new Error("Post not found");
    post.status = "rejected";
    return post;
  },
};

export const mockComplaintService = {
  async create(data: any): Promise<Complaint> {
    const complaint: Complaint = {
      $id: `mock_complaint_${Date.now()}`,
      userId: data.userId,
      subject: data.subject,
      description: data.description,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockComplaints.unshift(complaint);
    return complaint;
  },

  async getComplaints(userId: string): Promise<Complaint[]> {
    return mockComplaints.filter((c) => c.userId === userId);
  },

  async getAllComplaints(): Promise<Complaint[]> {
    return [...mockComplaints];
  },

  async reply(complaintId: string, reply: string, resolve?: boolean): Promise<Complaint> {
    const complaint = mockComplaints.find((c) => c.$id === complaintId);
    if (!complaint) throw new Error("Complaint not found");
    complaint.adminReply = reply;
    if (resolve) complaint.status = "resolved";
    return complaint;
  },
};

export const mockDisputeService = {
  async create(data: any): Promise<Dispute> {
    const dispute: Dispute = {
      $id: `mock_dispute_${Date.now()}`,
      jobId: data.jobId,
      raisedById: data.raisedById,
      reason: data.reason,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDisputes.unshift(dispute);
    return dispute;
  },

  async getDisputes(jobId?: string): Promise<Dispute[]> {
    let result = [...mockDisputes];
    if (jobId) result = result.filter((d) => d.jobId === jobId);
    return result;
  },

  async resolve(disputeId: string, decision: string, note: string): Promise<Dispute> {
    const dispute = mockDisputes.find((d) => d.$id === disputeId);
    if (!dispute) throw new Error("Dispute not found");
    dispute.status = "resolved";
    dispute.decision = decision as any;
    dispute.adminDecisionNote = note;
    return dispute;
  },
};

export const mockVerificationService = {
  async submitRequest(userId: string, role: string): Promise<VerificationRequest> {
    const req: VerificationRequest = {
      $id: `mock_vr_${Date.now()}`,
      userId,
      role: role as "translator" | "company",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return req;
  },

  async getPendingRequests(): Promise<VerificationRequest[]> {
    return [];
  },

  async approveRequest(requestId: string, note?: string): Promise<VerificationRequest> {
    return { $id: requestId, userId: "", role: "translator", status: "verified", adminNote: note, reviewedAt: new Date().toISOString(), createdAt: "", updatedAt: "" } as VerificationRequest;
  },

  async rejectRequest(requestId: string, note: string): Promise<VerificationRequest> {
    return { $id: requestId, userId: "", role: "translator", status: "rejected", adminNote: note, reviewedAt: new Date().toISOString(), createdAt: "", updatedAt: "" } as VerificationRequest;
  },
};

export const mockRatingService = {
  async create(data: any): Promise<Rating> {
    const rating: Rating = {
      $id: `mock_rating_${Date.now()}`,
      jobId: data.jobId,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      stars: data.stars,
      reviewText: data.reviewText,
      createdAt: new Date().toISOString(),
    };
    mockRatings.unshift(rating);
    return rating;
  },

  async getRatings(userId: string): Promise<Rating[]> {
    return mockRatings.filter((r) => r.toUserId === userId);
  },

  async getAverageRating(userId: string): Promise<number> {
    const ratings = await mockRatingService.getRatings(userId);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
  },
};
