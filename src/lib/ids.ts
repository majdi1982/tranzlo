import { ID } from "appwrite";

const ID_PREFIXES: Record<string, string> = {
  profile: "PROF",
  translator: "TRAN",
  company: "COMP",
  job: "JOB",
  application: "APP",
  conversation: "CONV",
  message: "MSG",
  notification: "NOTIF",
  verificationRequest: "VR",
  blogPost: "BLOG",
  hubPost: "HUB",
  complaint: "COMPL",
  dispute: "DISP",
  rating: "RATE",
  plan: "PLAN",
  user: "USR",
};

export function generateId(prefix: string): string {
  const p = prefix.toUpperCase();
  const unique = ID.unique();
  const suffix = unique.replace(/^unique\(\)/, "").slice(0, 16);
  return `${p}_${suffix}`;
}

export { ID };
