import { isMockEnabled } from "@/hooks/use-mock";
import * as mock from "./mock.service";
import * as appwrite from "./appwrite.service";

export function getServices() {
  if (isMockEnabled()) {
    return {
      auth: mock.mockAuthService,
      profile: mock.mockProfileService,
      job: mock.mockJobService,
      application: mock.mockApplicationService,
      message: mock.mockMessageService,
      notification: mock.mockNotificationService,
      blog: mock.mockBlogService,
      hub: mock.mockHubService,
      complaint: mock.mockComplaintService,
      dispute: mock.mockDisputeService,
      rating: mock.mockRatingService,
    };
  }

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
    rating: appwrite.appwriteRatingService,
  };
}
