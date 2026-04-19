import type { UserRole } from "@/lib/constants/roles";

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

export function canAccessCompany(role: UserRole | null | undefined): boolean {
  return role === "company" || role === "admin";
}

export function canAccessTranslator(role: UserRole | null | undefined): boolean {
  return role === "translator" || role === "admin";
}

