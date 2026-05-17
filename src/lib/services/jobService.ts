import { databases, APPWRITE_CONFIG } from '../appwrite';
import { generateTrzId } from '../utils/ids';
import { ID, Query } from 'appwrite';
import { NotificationService } from './notificationService';

export interface CreateJobData {
  title: string;
  description: string;
  paymentType: 'fixed' | 'hourly' | 'milestones';
  budget: number;
  currency?: string;
  fromLanguage: string;
  toLanguage: string;
  isInviteOnly?: boolean;
  createdBy: string;
  organizationId?: string;
}

export const JobService = {
  /**
   * Create a new job post with TRZ-JOB-XXXXXX public ID
   */
  async createJob(data: CreateJobData) {
    const publicId = generateTrzId('JOB');
    const now = new Date().toISOString();

    const jobDoc = {
      publicId,
      entityType: 'job',
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy,
      status: 'active',
      visibility: data.isInviteOnly ? 'private' : 'public',
      title: data.title,
      description: data.description,
      paymentType: data.paymentType,
      budget: data.budget,
      currency: data.currency || 'USD',
      fromLanguage: data.fromLanguage,
      toLanguage: data.toLanguage,
      isInviteOnly: data.isInviteOnly || false,
      organizationId: data.organizationId || null,
    };

    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'jobs',
        ID.unique(),
        jobDoc
      );

      // AUDIT LOGGING (Legal Requirement)
      await this.logAction('CREATE_JOB', data.createdBy, response.$id, `Created job ${publicId}`);

      // TRIGGER REAL-TIME NOTIFICATION (Compliance with notification laws & user rule)
      try {
        await NotificationService.createNotification({
          title: 'Job Posted Successfully!',
          message: `Your project "${data.title}" is now active with ID ${publicId}.`,
          type: 'system',
          userId: data.createdBy,
        });
      } catch (err) {
        console.error('Failed to trigger notification on job creation:', err);
      }

      return response;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  },

  /**
   * Fetch all public jobs
   */
  async getPublicJobs() {
    return await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      'jobs',
      [
        Query.equal('visibility', 'public'),
        Query.equal('status', 'active'),
        Query.orderDesc('createdAt')
      ]
    );
  },

  /**
   * System Audit Logger
   */
  async logAction(action: string, userId: string, entityId: string, details: string) {
    const now = new Date().toISOString();
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'auditLogs',
        ID.unique(),
        {
          publicId: generateTrzId('APP'), // Generic app log ID
          entityType: 'auditLog',
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          status: 'completed',
          visibility: 'private',
          metadata: JSON.stringify({ action, details }),
          userId: userId,
          jobId: entityId.startsWith('TRZ-JOB') ? entityId : null,
        }
      );
    } catch (e) {
      console.error('Audit Log failed:', e);
    }
  }
};
