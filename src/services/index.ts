import * as appwrite from "./appwrite.service";

export function getServices() {
  return {
    auth: appwrite.appwriteAuthService,
    profile: appwrite.appwriteProfileService,
    job: appwrite.appwriteJobService,
    application: appwrite.appwriteApplicationService,
    message: appwrite.appwriteMessageService,
    notification: appwrite.appwriteNotificationService,
    blog: appwrite.appwriteBlogService,
    hub: appwrite.appwriteHubService,
    complaint: appwrite.appwriteComplaintService,
    dispute: appwrite.appwriteDisputeService,
    verification: appwrite.appwriteVerificationService,
    rating: appwrite.appwriteRatingService,
    settings: appwrite.appwriteSettingsService,
    ledger: appwrite.appwriteLedgerService,
    invitation: appwrite.appwriteInvitationService,
  };
}
