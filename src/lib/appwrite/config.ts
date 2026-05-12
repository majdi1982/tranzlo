import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "main",
  usersCollectionId: "users",
  translatorsCollectionId: "translators",
  companiesCollectionId: "companies",
  adminsCollectionId: "admins",
  employeesCollectionId: "employees",
  jobsCollectionId: "jobs",
  jobApplicationsCollectionId: "jobApplications",
  projectsCollectionId: "projects",
  milestonesCollectionId: "milestones",
  chatRoomsCollectionId: "chatRooms",
  messagesCollectionId: "messages",
  filesCollectionId: "files",
  notificationsCollectionId: "notifications",
  disputesCollectionId: "disputes",
  teamsCollectionId: "teams",
  teamMembersCollectionId: "teamMembers",
  invitationsCollectionId: "invitations",
  reviewsCollectionId: "reviews",
  kycCollectionId: "kyc",
  auditLogsCollectionId: "auditLogs",
  bucketId: "tranzlo_assets"
};

export const client = new Client();

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
