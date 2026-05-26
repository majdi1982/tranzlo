import type { Role } from "@/types";

export const ROLES: Record<Role, Role> = {
  translator: "translator",
  company: "company",
  admin: "admin",
  staff: "staff",
};

export const ROLE_LABELS: Record<Role, string> = {
  translator: "Translator",
  company: "Company",
  admin: "Admin",
  staff: "Staff",
};

export const DASHBOARD_ROUTES: Record<Role, string> = {
  translator: "/dashboard/translator",
  company: "/dashboard/company",
  admin: "/dashboard/admin",
  staff: "/dashboard/staff",
};
