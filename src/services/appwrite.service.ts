import {
  getAccount,
  getDatabases,
  getFunctions,
  getMessaging,
  DB_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite";
import { generateId, ID } from "@/lib/ids";
import { getCompanyCommissionRate, getTranslatorCommissionRate } from "@/types/finance";
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
  BlogComment,
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

    try {
      // Auto-subscribe to system announcements
      const messaging = getMessaging();
      // A user's primary email target is often automatically available or we can just use the user ID as target ID if allowed,
      // but without targetId, creating subscriber in client SDK: messaging.createSubscriber('system_announcements', user.$id, targetId)
      // Since targetId is required and we don't have it on the client without creating it, we might need a server function.
      // But let's try calling it anyway or just leave it for server-side.
      // For now, let's add the target manually if allowed:
      // In Appwrite, you typically create an email target first:
      // Actually, we'll implement this properly using a Cloud Function in the future.
      // For now, we will add a pref 'newsletter: true' and sync it later.
      await account.updatePrefs({ role: input.role, newsletter: true });
    } catch (err) {
      console.warn("Failed to subscribe to topic:", err);
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

  async getSuggestedTranslators(sourceLanguages: string[], targetLanguages: string[], specializations: string[], companyId: string): Promise<(TranslatorProfile & { hasWorkedBefore: boolean })[]> {
    try {
      const db = getDatabases();
      
      const docs = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
        Query.equal("isPublicPlatform", true),
        Query.equal("onboardingComplete", true),
        Query.limit(200),
      ]);
      const allTranslators = docs.documents.map((d) => mapDoc<TranslatorProfile>(d as Record<string, unknown>));
      
      const filtered = allTranslators.filter(t => {
        const hasSource = sourceLanguages.some(lang => t.languages?.includes(lang));
        const hasTarget = targetLanguages.some(lang => t.languages?.includes(lang));
        return hasSource && hasTarget;
      });

      const companyJobs = await db.listDocuments(DB_ID, COLLECTIONS.jobs, [
        Query.equal("companyId", companyId),
        Query.limit(100)
      ]);
      const jobIds = companyJobs.documents.map(j => j.$id);
      
      let pastHires = new Set<string>();
      if (jobIds.length > 0) {
        // Find accepted/hired applications for these jobs
        const apps = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
          Query.equal("jobId", jobIds),
          Query.equal("status", "hired"),
          Query.limit(500)
        ]);
        apps.documents.forEach(app => pastHires.add(app.translatorId as string));
      }

      const mapped = filtered.map(t => ({
        ...t,
        hasWorkedBefore: pastHires.has(t.userId)
      }));

      return mapped.sort((a, b) => {
        if (a.hasWorkedBefore && !b.hasWorkedBefore) return -1;
        if (!a.hasWorkedBefore && b.hasWorkedBefore) return 1;
        return 0;
      });
    } catch {
      return [];
    }
  },
};

export const appwriteJobService = {
  async createJob(data: CreateJobInput & { companyId: string; invitedTranslators?: string[]; externalTranslatorEmail?: string }): Promise<Job> {
    const db = getDatabases();
    
    // Extract non-schema fields
    const { invitedTranslators, externalTranslatorEmail, ...jobData } = data;
    
    // Default invitation status for invited internal translators
    let invitationStatusObj: Record<string, string> = {};
    if (invitedTranslators && invitedTranslators.length > 0) {
      invitedTranslators.forEach(id => {
        invitationStatusObj[id] = "pending";
      });
    }

    const doc = await db.createDocument(DB_ID, COLLECTIONS.jobs, generateId("job"), {
      ...jobData,
      maxApplicants: jobData.maxApplicants || null,
      status: "open",
      invitationStatus: Object.keys(invitationStatusObj).length > 0 ? JSON.stringify(invitationStatusObj) : null,
      externalTranslatorEmail: externalTranslatorEmail || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // If private + internal, send notifications
    if (jobData.visibility === "private" && jobData.privateType === "internal" && invitedTranslators && invitedTranslators.length > 0) {
      const promises = invitedTranslators.map(translatorId => 
        db.createDocument(DB_ID, COLLECTIONS.notifications, generateId("notif"), {
          userId: translatorId,
          type: "job_invitation_external", // Used generally for invitations
          title: "You have been invited to a private job",
          body: `A company has invited you to apply for their private job: ${jobData.title}`,
          data: JSON.stringify({ jobId: doc.$id }),
          read: false,
          createdAt: new Date().toISOString()
        })
      );
      await Promise.allSettled(promises);
    }

    // If private + external, trigger invitation service
    if (jobData.visibility === "private" && jobData.privateType === "external" && externalTranslatorEmail) {
      await appwriteInvitationService.sendExternalInvitation(doc.$id, doc.companyId, externalTranslatorEmail);
    }
    
    return mapDoc<Job>(doc as Record<string, unknown>);
  },

  async inviteTranslator(jobId: string, translatorId: string): Promise<Job> {
    const db = getDatabases();
    const job = await db.getDocument(DB_ID, COLLECTIONS.jobs, jobId);
    const invited: string[] = (job.invitedTranslators as string[]) || [];
    if (!invited.includes(translatorId)) {
      invited.push(translatorId);
    }
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.jobs, jobId, {
      invitedTranslators: invited,
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
    const existingJob = await appwriteJobService.getJob(jobId);
    if (!existingJob) throw new Error("Job not found");
    
    const now = new Date().getTime();
    const createdAt = new Date(existingJob.createdAt).getTime();
    if (now - createdAt > 60 * 60 * 1000) {
      throw new Error("Jobs cannot be edited 1 hour after posting.");
    }

    const doc = await db.updateDocument(DB_ID, COLLECTIONS.jobs, jobId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    
    // If invitedTranslators changed, send notifications to the newly invited ones
    if (data.invitedTranslators && Array.isArray(data.invitedTranslators)) {
      const existingInvited = Array.isArray(existingJob.invitedTranslators) ? existingJob.invitedTranslators as string[] : [];
      const newInvites = data.invitedTranslators.filter(id => !existingInvited.includes(id));
      
      if (newInvites.length > 0) {
        const promises = newInvites.map(translatorId => 
          db.createDocument(DB_ID, COLLECTIONS.notifications, generateId("notif"), {
            userId: translatorId,
            type: "invitation",
            title: "You have been invited to a private job",
            body: `A company has invited you to apply for their private job: ${existingJob.title}`,
            data: JSON.stringify({ jobId }),
            read: false,
            createdAt: new Date().toISOString()
          })
        );
        await Promise.allSettled(promises);
      }
    }

    return mapDoc<Job>(doc as Record<string, unknown>);
  },

  async closeJob(jobId: string): Promise<Job> {
    const db = getDatabases();
    const now = new Date().toISOString();
    const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.jobs, jobId, {
      status: "closed",
      testDistributedAt: now,
      testDeadline: deadline,
      updatedAt: now,
    });
    return mapDoc<Job>(doc as Record<string, unknown>);
  },
};

export const appwriteInvitationService = {
  async sendExternalInvitation(jobId: string, companyId: string, email: string): Promise<boolean> {
    const db = getDatabases();
    
    try {
      const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
        Query.equal("email", email),
        Query.limit(1)
      ]);

      if (profiles.documents.length > 0) {
        const translatorId = profiles.documents[0].userId as string;
        await db.createDocument(DB_ID, COLLECTIONS.notifications, generateId("notif"), {
          userId: translatorId,
          type: "job_invitation_external",
          title: "You have been invited to a private job",
          body: `A company has invited you to a job. Check your dashboard.`,
          data: JSON.stringify({ jobId }),
          read: false,
          createdAt: new Date().toISOString()
        });

        const job = await db.getDocument(DB_ID, COLLECTIONS.jobs, jobId);
        let statusObj: Record<string, string> = {};
        if (job.invitationStatus) {
          try { statusObj = JSON.parse(job.invitationStatus); } catch {}
        }
        statusObj[translatorId] = "pending";
        await db.updateDocument(DB_ID, COLLECTIONS.jobs, jobId, {
          invitationStatus: JSON.stringify(statusObj)
        });

      } else {
        console.log(`Sending external invitation email to ${email} for job ${jobId}`);
      }
      return true;
    } catch {
      return false;
    }
  },

  async respondToInvitation(jobId: string, translatorId: string, response: "accepted" | "rejected"): Promise<boolean> {
    try {
      const db = getDatabases();
      const job = await db.getDocument(DB_ID, COLLECTIONS.jobs, jobId);
      
      let statusObj: Record<string, string> = {};
      if (job.invitationStatus) {
        try { statusObj = JSON.parse(job.invitationStatus); } catch {}
      }
      statusObj[translatorId] = response;

      await db.updateDocument(DB_ID, COLLECTIONS.jobs, jobId, {
        invitationStatus: JSON.stringify(statusObj)
      });

      const profile = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
        Query.equal("userId", translatorId),
        Query.limit(1)
      ]);
      const translatorName = profile.documents[0]?.fullName || "A translator";

      await db.createDocument(DB_ID, COLLECTIONS.notifications, generateId("notif"), {
        userId: job.companyId,
        type: response === "accepted" ? "job_invitation_accepted" : "job_invitation_rejected",
        title: `Job Invitation ${response === "accepted" ? "Accepted" : "Declined"}`,
        body: `${translatorName} has ${response} your invitation to ${job.title}`,
        data: JSON.stringify({ jobId }),
        read: false,
        createdAt: new Date().toISOString()
      });

      if (response === "accepted") {
        await appwriteApplicationService.apply({
          jobId,
          translatorId,
          coverLetter: "Automatically applied via invitation acceptance",
        });
      }

      return true;
    } catch {
      return false;
    }
  }
};

export const appwriteApplicationService = {
  async apply(data: ApplyInput & { translatorId: string }): Promise<Application> {
    const db = getDatabases();

    const job = await appwriteJobService.getJob(data.jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== "open") throw new Error("Job is not open for applications");

    // Validate bid against budget range
    if (data.bidAmount) {
      const min = job.budgetMin || 0;
      const max = job.budgetMax || job.budget;
      if (data.bidAmount < min || data.bidAmount > max) {
        throw new Error(`Bid must be between $${min} and $${max} USD`);
      }
    }

    const existingApps = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
      Query.equal("jobId", data.jobId),
    ]);

    if (job.requiresTest) {
      // For test jobs: enforce maxTestApplicants per language pair
      const maxTestApplicants = job.maxTestApplicants || 10;
      const languagePair = (data as any).languagePair || "";

      const pairCount = existingApps.documents.filter((a) => {
        if (!languagePair) return true;
        const normalize = (s: string) => s.replace(/\s+/g, "").toUpperCase();
        return normalize((a as any).languagePair || "") === normalize(languagePair);
      }).length;

      if (pairCount >= maxTestApplicants) {
        throw new Error(
          `The maximum number of test applicants (${maxTestApplicants}) has been reached for this language pair.`
        );
      }

      // Prevent duplicate application from same translator
      const alreadyApplied = existingApps.documents.find(
        (a) => (a as any).translatorId === data.translatorId
      );
      if (alreadyApplied) {
        throw new Error("You have already applied for this job.");
      }
    } else {
      // For non-test jobs: enforce global maxApplicants cap
      if (job.maxApplicants && existingApps.total >= job.maxApplicants) {
        throw new Error("This job has reached the maximum number of applicants");
      }
    }

    const doc = await db.createDocument(DB_ID, COLLECTIONS.applications, generateId("application"), {
      ...data,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // For non-test jobs only: auto-close when global maxApplicants is hit
    if (!job.requiresTest && job.maxApplicants) {
      const updatedTotal = existingApps.total + 1;
      if (updatedTotal >= job.maxApplicants) {
        await db.updateDocument(DB_ID, COLLECTIONS.jobs, data.jobId, {
          status: "closed",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return mapDoc<Application>(doc as Record<string, unknown>);
  },

  async getApplicationById(id: string): Promise<Application> {
    const db = getDatabases();
    const doc = await db.getDocument(DB_ID, COLLECTIONS.applications, id);
    return mapDoc<Application>(doc as Record<string, unknown>);
  },

  async getApplications(jobId: string): Promise<Application[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
      Query.equal("jobId", jobId),
    ]);
    return result.documents.map((d) => mapDoc<Application>(d as Record<string, unknown>));
  },

  async getAllApplications(): Promise<Application[]> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
        Query.limit(100),
        Query.orderDesc("$createdAt")
      ]);
      return res.documents.map((d) => mapDoc<Application>(d as Record<string, unknown>));
    } catch (error) {
      console.error("Failed to fetch all applications:", error);
      return [];
    }
  },

  async getMyApplications(translatorId: string): Promise<Application[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
      Query.equal("translatorId", translatorId),
    ]);
    return result.documents.map((d) => mapDoc<Application>(d as Record<string, unknown>));
  },

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    testStatus?: string,
    testSolutionUrl?: string
  ): Promise<Application> {
    const db = getDatabases();
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (testStatus) {
      updateData.testStatus = testStatus;
      if (testStatus === "passed" || testStatus === "failed") {
        updateData.testGradedAt = new Date().toISOString();
      }
    }
    if (testSolutionUrl) {
      updateData.testSolutionUrl = testSolutionUrl;
      updateData.testSubmittedAt = new Date().toISOString();
    }
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.applications, applicationId, updateData);
    return mapDoc<Application>(doc as Record<string, unknown>);
  },

  async updateApplicationWithFeedback(
    applicationId: string,
    data: { testStatus?: string; testFeedback?: string; status?: string; rejectionReason?: string; testReviewedFileUrl?: string; extensionStatus?: string; extensionReason?: string; extensionRequestedAt?: string; extensionDate?: string; deliveryFileUrl?: string; deliveryDate?: string; escrowStatus?: string; disputeId?: string; revisionStatus?: string; revisionReason?: string; revisionReviewedFileUrl?: string; earlyReleaseRequested?: boolean; }
  ): Promise<Application> {
    const db = getDatabases();
    const updateData: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (data.testStatus === "passed" || data.testStatus === "failed") {
      updateData.testGradedAt = new Date().toISOString();
    }
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.applications, applicationId, updateData);
    return mapDoc<Application>(doc as Record<string, unknown>);
  },

  async requestEarlyRelease(applicationId: string): Promise<Application> {
    try {
      const db = getDatabases();
      const res = await db.updateDocument(DB_ID, COLLECTIONS.applications, applicationId, {
        earlyReleaseRequested: true,
        updatedAt: new Date().toISOString()
      });
      return mapDoc<Application>(res as Record<string, unknown>);
    } catch (error) {
      console.error("Failed to request early release:", error);
      throw error;
    }
  },

  async selectTranslator(jobId: string, selectedAppId: string): Promise<void> {
    const db = getDatabases();
    const apps = await appwriteApplicationService.getApplications(jobId);

    // Accept the selected translator
    const selected = apps.find((a) => a.$id === selectedAppId);
    if (selected) {
      await db.updateDocument(DB_ID, COLLECTIONS.applications, selectedAppId, {
        status: "accepted",
        updatedAt: new Date().toISOString(),
      });
    }

    // Reject all other applicants with pending status
    for (const app of apps) {
      if (app.$id !== selectedAppId && (app.status === "submitted" || app.status === "viewed" || app.status === "shortlisted")) {
        await db.updateDocument(DB_ID, COLLECTIONS.applications, app.$id, {
          status: "rejected",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Update job status to filled
    await appwriteJobService.updateJob(jobId, {
      status: "filled",
      activeTranslatorId: selected?.translatorId,
    });
  },

  async acceptDelivery(jobId: string, applicationId: string, translatorId: string, baseValue: number, companyId: string): Promise<void> {
    const db = getDatabases();
    
    // 1. Process Escrow Release
    await appwriteLedgerService.processEscrowRelease(jobId, translatorId, baseValue);

    // 2. Update Application Status
    await db.updateDocument(DB_ID, COLLECTIONS.applications, applicationId, {
      status: "completed",
      updatedAt: new Date().toISOString(),
    });

    // 3. Update Job Status
    await appwriteJobService.updateJob(jobId, {
      status: "closed",
    });

    // 4. Send Notifications
    await appwriteNotificationService.createNotification({
      userId: translatorId,
      type: "job_completed",
      title: "Project Completed & Paid",
      body: `The client has accepted your delivery for the project. Funds have been added to your balance.`,
      data: { jobId, applicationId },
    });
    
    await appwriteNotificationService.createNotification({
      userId: companyId,
      type: "job_completed",
      title: "Delivery Accepted",
      body: `You have accepted the delivery. The project is now marked as completed.`,
      data: { jobId, applicationId },
    });
  },

  async getInvitedJobs(translatorId: string): Promise<Job[]> {
    try {
      const db = getDatabases();
      const result = await db.listDocuments(DB_ID, COLLECTIONS.jobs, [
        Query.equal("invitedTranslators", translatorId),
        Query.equal("status", "open"),
      ]);
      return result.documents.map((d) => mapDoc<Job>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async fundEscrow(jobId: string, companyId: string, translatorId: string, baseValue: number, captureId: string): Promise<any> {
    const db = getDatabases();
    const ledgerEntry = await appwriteLedgerService.processEscrowFunding(jobId, companyId, translatorId, baseValue, captureId);
    return ledgerEntry;
  },

  async inviteToTest(applicationId: string, jobId: string, companyId: string): Promise<Application> {
    const db = getDatabases();
    const app = await db.getDocument(DB_ID, COLLECTIONS.applications, applicationId);
    const job = await db.getDocument(DB_ID, COLLECTIONS.jobs, jobId);

    const translatorId = app.translatorId as string;
    const languagePair = (app.languagePair as string) || "";
    const jobTitle = (job.title as string) || "";
    const testFileUrl = (job.testFileUrl as string) || "";

    // 1. Create conversation with jobId
    const conv = await db.createDocument(DB_ID, COLLECTIONS.conversations, generateId("conversation"), {
      participants: [companyId, translatorId],
      jobId,
      createdAt: new Date().toISOString(),
    });
    const conversationId = conv.$id;

    // 2. Send welcome message with test download link
    let msg = `Welcome! You've been invited to complete the translation test for "${jobTitle}".`;
    msg += `\nLanguage Pair: ${languagePair || "N/A"}`;
    if (testFileUrl) {
      msg += `\n\nDownload the test file here: ${testFileUrl}`;
    }
    msg += `\n\nPlease submit your completed solution from your Applications dashboard before the deadline. Good luck!`;

    await db.createDocument(DB_ID, COLLECTIONS.messages, generateId("message"), {
      conversationId,
      senderId: companyId,
      content: msg,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // 3. Create notification for translator
    await db.createDocument(DB_ID, COLLECTIONS.notifications, generateId("notif"), {
      userId: translatorId,
      type: "test_distributed",
      title: "Translation Test Invitation",
      body: `You've been invited to complete the test for "${jobTitle}". Check your messages to download the test file.`,
      data: JSON.stringify({ jobId, conversationId }),
      read: false,
      createdAt: new Date().toISOString(),
    });

    // 4. Update application
    const updated = await db.updateDocument(DB_ID, COLLECTIONS.applications, applicationId, {
      status: "test_invited",
      conversationId,
      testInvitedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return mapDoc<Application>(updated as Record<string, unknown>);
  },
};

export const appwriteMessageService = {
  async createConversation(participants: string[], jobId?: string, languagePair?: string): Promise<Conversation> {
    const db = getDatabases();

    if (jobId) {
      try {
        const existing = await db.listDocuments(DB_ID, COLLECTIONS.conversations, [
          Query.equal("jobId", jobId)
        ]);
        const match = existing.documents.find(doc => 
          Array.isArray(doc.participants) && 
          doc.participants.length === participants.length && 
          participants.every(p => doc.participants.includes(p))
        );
        if (match) {
          return mapDoc<Conversation>(match as Record<string, unknown>);
        }
      } catch (err) {
        // Fallback to create if list fails
      }
    }

    const doc = await db.createDocument(DB_ID, COLLECTIONS.conversations, generateId("conversation"), {
      participants,
      ...(jobId && { jobId }),
      createdAt: new Date().toISOString(),
    });
    return mapDoc<Conversation>(doc as Record<string, unknown>);
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.conversations, [
      Query.contains("participants", userId),
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
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.notifications, generateId("notification"), {
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data ? JSON.stringify(data.data) : "",
      read: false,
      createdAt: new Date().toISOString(),
    });
    return mapDoc<Notification>(doc as Record<string, unknown>);
  },

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
    
    // Check if there is already a pending request to prevent duplicates
    const existing = await db.listDocuments(DB_ID, COLLECTIONS.verificationRequests, [
      Query.equal("userId", userId),
      Query.equal("status", "pending"),
      Query.limit(1)
    ]);

    let doc;
    if (existing.documents.length > 0) {
      doc = await db.updateDocument(DB_ID, COLLECTIONS.verificationRequests, existing.documents[0].$id, {
        updatedAt: new Date().toISOString(),
      });
    } else {
      doc = await db.createDocument(DB_ID, COLLECTIONS.verificationRequests, generateId("verificationRequest"), {
        userId,
        role,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    try {
      const collection = role === "translator" ? COLLECTIONS.translatorProfiles : COLLECTIONS.companyProfiles;
      const profileDocs = await db.listDocuments(DB_ID, collection, [
        Query.equal("userId", userId),
        Query.limit(1)
      ]);
      if (profileDocs.documents.length > 0) {
        await db.updateDocument(DB_ID, collection, profileDocs.documents[0].$id, {
          verificationStatus: "pending",
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to update profile verification status on submit:", err);
    }

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

    try {
      const role = (doc as any).role;
      const userId = (doc as any).userId;
      const collection = role === "translator" ? COLLECTIONS.translatorProfiles : COLLECTIONS.companyProfiles;
      const profileDocs = await db.listDocuments(DB_ID, collection, [
        Query.equal("userId", userId),
        Query.limit(1)
      ]);
      if (profileDocs.documents.length > 0) {
        await db.updateDocument(DB_ID, collection, profileDocs.documents[0].$id, {
          isVerified: true,
          verificationStatus: "verified",
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to update profile verification status on approve:", err);
    }

    return mapDoc<VerificationRequest>(doc as Record<string, unknown>);
  },

  async rejectRequest(requestId: string, note: string): Promise<VerificationRequest> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.verificationRequests, requestId, {
      status: "rejected",
      adminNote: note,
      reviewedAt: new Date().toISOString(),
    });

    try {
      const role = (doc as any).role;
      const userId = (doc as any).userId;
      const collection = role === "translator" ? COLLECTIONS.translatorProfiles : COLLECTIONS.companyProfiles;
      const profileDocs = await db.listDocuments(DB_ID, collection, [
        Query.equal("userId", userId),
        Query.limit(1)
      ]);
      if (profileDocs.documents.length > 0) {
        await db.updateDocument(DB_ID, collection, profileDocs.documents[0].$id, {
          isVerified: false,
          verificationStatus: "rejected",
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to update profile verification status on reject:", err);
    }

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
    const post = await appwriteBlogService.updatePost(postId, {
      status: "published",
      publishedAt: new Date().toISOString(),
    } as Partial<BlogPost>);

    const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://tranzlo.net"}/blog/${post.slug}`;
    const plainExcerpt = (post.excerpt || post.content || "").replace(/<[^>]*>/g, "").slice(0, 200);
    const hashtags = "#translation #localization #freelance";

    // X / Twitter
    const twitterBearer = process.env.TWITTER_BEARER_TOKEN;
    if (twitterBearer) {
      try {
        const tweetText = `${post.title}\n\n${plainExcerpt}\n\n${postUrl} ${hashtags}`;
        await fetch("https://api.twitter.com/2/tweets", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${twitterBearer}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: tweetText.slice(0, 280) }),
        });
      } catch (e) {
        console.error("[Social] Twitter failed:", (e as Error).message);
      }
    }

    // Facebook
    const fbPageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (fbPageToken) {
      try {
        await fetch(`https://graph.facebook.com/v19.0/me/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `${post.title}\n\n${plainExcerpt}`,
            link: postUrl,
            access_token: fbPageToken,
          }),
        });
      } catch (e) {
        console.error("[Social] Facebook failed:", (e as Error).message);
      }
    }

    // LinkedIn
    const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (linkedinToken) {
      try {
        const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${linkedinToken}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
          const author = orgId ? `urn:li:organization:${orgId}` : `urn:li:person:${profile.sub}`;
          await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${linkedinToken}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify({
              author,
              lifecycleState: "PUBLISHED",
              specificContent: {
                "com.linkedin.ugc.ShareContent": {
                  shareCommentary: { text: `${post.title}\n\n${plainExcerpt}` },
                  shareMediaCategory: "ARTICLE",
                  media: [{ status: "READY", originalUrl: postUrl }],
                },
              },
              visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
            }),
          });
        }
      } catch (e) {
        console.error("[Social] LinkedIn failed:", (e as Error).message);
      }
    }

    return post;
  },

  async deletePost(postId: string): Promise<void> {
    const db = getDatabases();
    await db.deleteDocument(DB_ID, COLLECTIONS.blogPosts, postId);
  },

  async toggleLike(postId: string, userId: string): Promise<string[]> {
    const db = getDatabases();
    const post = await db.getDocument(DB_ID, COLLECTIONS.blogPosts, postId);
    const likes = (post.likes as string[]) || [];
    const idx = likes.indexOf(userId);
    if (idx > -1) likes.splice(idx, 1);
    else likes.push(userId);
    await db.updateDocument(DB_ID, COLLECTIONS.blogPosts, postId, { likes });
    return likes;
  },

  async getComments(postId: string, userId?: string): Promise<BlogComment[]> {
    const db = getDatabases();
    const result = await db.listDocuments(DB_ID, COLLECTIONS.blogComments, [
      Query.equal("postId", postId),
      Query.orderDesc("createdAt"),
    ]);
    
    // Filter logic: show if approved, OR if it belongs to the requesting user
    return result.documents
      .map((d) => mapDoc<BlogComment>(d as Record<string, unknown>))
      .filter((c) => c.status === "approved" || (userId && c.userId === userId));
  },

  async createComment(postId: string, userId: string, userName: string, content: string, userAvatar?: string): Promise<BlogComment> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.blogComments, generateId("blogComment"), {
      postId,
      userId,
      userName,
      userAvatar: userAvatar || "",
      content,
      status: "pending", // All new comments are pending by default
      createdAt: new Date().toISOString(),
    });
    return mapDoc<BlogComment>(doc as Record<string, unknown>);
  },

  async getAllCommentsForAdmin(statusFilter?: "pending" | "approved" | "rejected"): Promise<BlogComment[]> {
    const db = getDatabases();
    const queries = [Query.orderDesc("createdAt")];
    if (statusFilter) {
      queries.push(Query.equal("status", statusFilter));
    }
    const result = await db.listDocuments(DB_ID, COLLECTIONS.blogComments, queries);
    return result.documents.map((d) => mapDoc<BlogComment>(d as Record<string, unknown>));
  },

  async updateCommentStatus(commentId: string, status: "approved" | "rejected"): Promise<void> {
    const db = getDatabases();
    const comment = await db.getDocument(DB_ID, COLLECTIONS.blogComments, commentId);
    await db.updateDocument(DB_ID, COLLECTIONS.blogComments, commentId, { status });

    // Notify the user about their comment status
    if (comment.userId) {
      await appwriteNotificationService.createNotification({
        userId: comment.userId,
        type: "system",
        title: status === "approved" ? "Comment Approved! 🎉" : "Comment Rejected ❌",
        body: status === "approved" 
          ? `Your comment on a blog post was approved and is now live.` 
          : `Your comment on a blog post was rejected.`,
        data: { actionUrl: `/blog` },
      });
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    const db = getDatabases();
    await db.deleteDocument(DB_ID, COLLECTIONS.blogComments, commentId);
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

  async getDisputes(jobId?: string, jobIds?: string[]): Promise<Dispute[]> {
    const db = getDatabases();
    const queries: string[] = [];
    if (jobId) queries.push(Query.equal("jobId", jobId));
    if (jobIds && jobIds.length > 0) queries.push(Query.equal("jobId", jobIds));
    const result = await db.listDocuments(DB_ID, COLLECTIONS.disputes, queries);
    return result.documents.map((d) => mapDoc<Dispute>(d as Record<string, unknown>));
  },

  async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const db = getDatabases();
      const doc = await db.getDocument(DB_ID, COLLECTIONS.disputes, disputeId);
      return mapDoc<Dispute>(doc as Record<string, unknown>);
    } catch {
      return null;
    }
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

  async submitEvidence(disputeId: string, justifications: string, evidenceFiles: string[]): Promise<Dispute> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.disputes, disputeId, {
      justifications,
      evidenceFiles,
      status: "pending",
      updatedAt: new Date().toISOString(),
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

export const appwriteSettingsService = {
  async getSetting(key: string, defaultValue: string = ""): Promise<string> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.systemSettings, [
        Query.equal("key", key),
        Query.limit(1),
      ]);
      if (res.documents.length > 0) {
        return res.documents[0].value as string;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  },

  async setSetting(key: string, value: string): Promise<void> {
    const db = getDatabases();
    try {
      const res = await db.listDocuments(DB_ID, COLLECTIONS.systemSettings, [
        Query.equal("key", key),
        Query.limit(1),
      ]);
      if (res.documents.length > 0) {
        await db.updateDocument(DB_ID, COLLECTIONS.systemSettings, res.documents[0].$id, { value });
      } else {
        await db.createDocument(DB_ID, COLLECTIONS.systemSettings, generateId("setting"), { key, value });
      }
    } catch (e) {
      console.error("Failed to set system setting:", e);
    }
  },
};

export const appwriteLedgerService = {
  async processEscrowFunding(jobId: string, companyId: string, translatorId: string, baseValue: number, captureId: string): Promise<any> {
    const db = getDatabases();
    
    // 1. Get Company Profile to check plan Tier
    const companyProfiles = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [
      Query.equal("userId", companyId),
      Query.limit(1)
    ]);
    const companyPlanTier = companyProfiles.documents.length > 0 ? (companyProfiles.documents[0].planTier || "free") : "free";

    // 2. Get Translator Profile to check plan Tier and lock in the fee
    const transProfiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
      Query.equal("userId", translatorId),
      Query.limit(1)
    ]);
    const transPlanTier = transProfiles.documents.length > 0 ? (transProfiles.documents[0].planTier || "free") : "free";

    // 3. Calculate Fees
    const companyFeePercent = getCompanyCommissionRate(companyPlanTier);
    const companyFeeAmount = baseValue * companyFeePercent;
    const totalAmount = baseValue + companyFeeAmount;

    const transFeePercent = getTranslatorCommissionRate(transPlanTier);
    const translatorFeeAmount = baseValue * transFeePercent;

    // 4. Find Application and Lock in Fees
    const apps = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
      Query.equal("jobId", jobId),
      Query.equal("translatorId", translatorId),
      Query.limit(1)
    ]);
    if (apps.documents.length > 0) {
      await db.updateDocument(DB_ID, COLLECTIONS.applications, apps.documents[0].$id, {
        companyFeeAmount,
        translatorFeeAmount,
      });
    }

    // 5. Create Company Invoice
    await db.createDocument(DB_ID, COLLECTIONS.invoices, generateId("inv"), {
      invoiceNumber: `INV-${Date.now()}-C`,
      projectId: jobId,
      companyId: companyId,
      translatorId: translatorId,
      jobBaseValue: baseValue,
      companyFeeAmount: companyFeeAmount,
      translatorFeeAmount: 0,
      totalCompanyPaid: totalAmount,
      netTranslatorEarned: 0,
      status: "completed",
      paypalTransactionId: captureId, // Save PayPal Capture ID
    });

    // 6. Create Transaction Ledger entry
    return this.createTransaction({
      transactionId: captureId,
      code: `escrow_fund_${jobId}`,
      userId: companyId,
      userName: companyProfiles.documents[0]?.companyName || "Company",
      userEmail: "", 
      type: "job_escrow",
      planTier: companyPlanTier,
      amount: totalAmount,
      feeDeducted: companyFeeAmount,
      status: "funded"
    });
  },

  async processEscrowRelease(jobId: string, translatorId: string, baseValue: number, payoutBatchId?: string): Promise<any> {
    const db = getDatabases();
    
    // Get job to find companyId
    const job = await db.getDocument(DB_ID, COLLECTIONS.jobs, jobId);
    const companyId = job.companyId as string;

    // 1. Get Translator Profile
    const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
      Query.equal("userId", translatorId),
      Query.limit(1)
    ]);
    const profile = profiles.documents[0];
    const planTier = profile?.planTier || "free";

    // 2. Read Locked Fee from Application
    const apps = await db.listDocuments(DB_ID, COLLECTIONS.applications, [
      Query.equal("jobId", jobId),
      Query.equal("translatorId", translatorId),
      Query.limit(1)
    ]);
    
    let feeAmount = 0;
    if (apps.documents.length > 0 && apps.documents[0].translatorFeeAmount !== undefined) {
      feeAmount = apps.documents[0].translatorFeeAmount;
    } else {
      // Fallback if missing
      const feePercent = getTranslatorCommissionRate(planTier);
      feeAmount = baseValue * feePercent;
    }
    const netPayout = baseValue - feeAmount;

    // 3. Create Translator Invoice
    const transactionId = payoutBatchId || generateId("payout");
    
    await db.createDocument(DB_ID, COLLECTIONS.invoices, generateId("inv"), {
      invoiceNumber: `INV-${Date.now()}-T`,
      projectId: jobId,
      companyId: companyId,
      translatorId: translatorId,
      jobBaseValue: baseValue,
      companyFeeAmount: 0,
      translatorFeeAmount: feeAmount,
      totalCompanyPaid: 0,
      netTranslatorEarned: netPayout,
      status: "completed",
      paypalTransactionId: transactionId, // Save PayPal Payout Batch ID
    });

    // 4. Update Translator Balance
    if (profile) {
      await db.updateDocument(DB_ID, COLLECTIONS.translatorProfiles, profile.$id, {
        availableBalance: (profile.availableBalance || 0) + netPayout,
        updatedAt: new Date().toISOString()
      });
    }

    // 5. Create Transaction Ledger entry
    return this.createTransaction({
      transactionId: transactionId,
      code: `escrow_release_${jobId}`,
      userId: translatorId,
      userName: profile?.fullName || "Translator",
      userEmail: "", 
      type: "job_escrow",
      planTier,
      amount: netPayout,
      feeDeducted: feeAmount,
      status: "released"
    });
  },

  async getInvoices(): Promise<any[]> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.invoices, [
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return res.documents.map((d) => mapDoc<any>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async getInvoicesByUser(userId: string): Promise<any[]> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.invoices, [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return res.documents.map((d) => mapDoc<any>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async getInvoicesByJob(jobId: string): Promise<any[]> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.invoices, [
        Query.equal("jobId", jobId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ]);
      return res.documents.map((d) => mapDoc<any>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async getTransactionsByUser(userId: string): Promise<any[]> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.transactionsLedger, [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(100),
      ]);
      return res.documents.map((d) => mapDoc<any>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async getTransactions(): Promise<any[]> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.transactionsLedger, [
        Query.orderDesc("createdAt"),
        Query.limit(100),
      ]);
      return res.documents.map((d) => mapDoc<any>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async createTransaction(data: {
    transactionId: string;
    code: string;
    userId: string;
    userName: string;
    userEmail: string;
    type: "subscription" | "job_escrow";
    planTier: string;
    amount: number;
    feeDeducted?: number;
    status: "funded" | "approved" | "released" | "refunded" | "failed";
  }): Promise<any> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.transactionsLedger, generateId("tx"), {
      ...data,
      feeDeducted: data.feeDeducted || 0,
      createdAt: new Date().toISOString(),
    });
    return mapDoc<any>(doc as Record<string, unknown>);
  },

  async releaseManualPayout(txDocId: string): Promise<void> {
    const db = getDatabases();
    const tx = await db.getDocument(DB_ID, COLLECTIONS.transactionsLedger, txDocId);
    if (!tx || tx.status === "released") return;

    const netPayout = (tx.amount as number) - (tx.feeDeducted as number);
    const userId = tx.userId as string;

    const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    if (profiles.documents.length > 0) {
      const profile = profiles.documents[0];
      const newBalance = (profile.availableBalance || 0) + netPayout;
      await db.updateDocument(DB_ID, COLLECTIONS.translatorProfiles, profile.$id, {
        availableBalance: newBalance,
        updatedAt: new Date().toISOString(),
      });
    }

    await db.updateDocument(DB_ID, COLLECTIONS.transactionsLedger, txDocId, {
      status: "released",
      createdAt: new Date().toISOString(),
    });
  },

  async paypalPayout(payoutEmail: string, amount: number, speed: "standard" | "instant"): Promise<any> {
    const db = getDatabases();
    const fee = speed === "instant" ? 5.00 : 0.00;
    const doc = await db.createDocument(DB_ID, COLLECTIONS.transactionsLedger, generateId("tx"), {
      transactionId: `payout_${Date.now()}`,
      code: `admin_withdrawal`,
      userId: "admin",
      userName: "Platform Administrator",
      userEmail: payoutEmail,
      type: "subscription",
      planTier: "pro",
      amount: -amount,
      feeDeducted: fee,
      status: "released",
      transferStatus: speed === "instant" ? "succeeded" : "pending",
      responseLog: "",
      createdAt: new Date().toISOString(),
    });
    return mapDoc<any>(doc as Record<string, unknown>);
  },

  async getEmployees(): Promise<any[]> {
    try {
      const db = getDatabases();
      const res = await db.listDocuments(DB_ID, COLLECTIONS.employeeSalaries, [
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return res.documents.map((d) => mapDoc<any>(d as Record<string, unknown>));
    } catch {
      return [];
    }
  },

  async createEmployee(data: {
    name: string;
    jobTitle: string;
    baseSalary: number;
    payoutAccount: string;
    paymentMethod: string;
  }): Promise<any> {
    const db = getDatabases();
    const doc = await db.createDocument(DB_ID, COLLECTIONS.employeeSalaries, generateId("emp"), {
      employeeId: `emp_${Date.now()}`,
      ...data,
      paymentStatus: "pending",
      transferStatus: "pending",
      lastPayoutDate: null,
    });
    return mapDoc<any>(doc as Record<string, unknown>);
  },

  async updateEmployee(docId: string, data: Partial<{
    name: string;
    jobTitle: string;
    baseSalary: number;
    payoutAccount: string;
    paymentMethod: string;
    paymentStatus: string;
    transferStatus: string;
    lastPayoutDate: string;
  }>): Promise<any> {
    const db = getDatabases();
    const doc = await db.updateDocument(DB_ID, COLLECTIONS.employeeSalaries, docId, data);
    return mapDoc<any>(doc as Record<string, unknown>);
  },

  async payEmployeeSalary(docId: string, employeeId: string, name: string, payoutAccount: string, amount: number, speed: "standard" | "instant"): Promise<void> {
    const db = getDatabases();
    const transferStatusVal = speed === "instant" ? "succeeded" : "pending";
    await db.updateDocument(DB_ID, COLLECTIONS.employeeSalaries, docId, {
      paymentStatus: "paid",
      transferStatus: transferStatusVal,
      lastPayoutDate: new Date().toISOString(),
    });
    await db.createDocument(DB_ID, COLLECTIONS.transactionsLedger, generateId("tx"), {
      transactionId: `payout_salary_${Date.now()}`,
      code: `salary_${employeeId}`,
      userId: employeeId,
      userName: name,
      userEmail: payoutAccount,
      type: "subscription",
      planTier: "free",
      amount: -amount,
      feeDeducted: speed === "instant" ? 5.00 : 0.00,
      status: "released",
      transferStatus: transferStatusVal,
      responseLog: "",
      createdAt: new Date().toISOString(),
    });
  },
};

export const appwriteMessagingService = {
  async getTopics(): Promise<any[]> {
    try {
      const messaging = getMessaging();
      // Client SDK usually doesn't expose getTopics directly if restricted, 
      // but we will attempt it or assume topics are pre-created.
      // For now, let's return a hardcoded list of known topics if we can't fetch.
      return [];
    } catch {
      return [];
    }
  },

  async subscribe(topicId: string, targetId: string): Promise<boolean> {
    try {
      const messaging = getMessaging();
      await messaging.createSubscriber(topicId, targetId, targetId);
      return true;
    } catch (e) {
      console.error("Failed to subscribe:", e);
      return false;
    }
  },

  async unsubscribe(topicId: string, subscriberId: string): Promise<boolean> {
    try {
      const messaging = getMessaging();
      await messaging.deleteSubscriber(topicId, subscriberId);
      return true;
    } catch (e) {
      console.error("Failed to unsubscribe:", e);
      return false;
    }
  }
};
