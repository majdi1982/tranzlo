import { USER_ROLES } from "@/lib/constants/roles";

export type AuthFormErrors = Partial<Record<"email" | "password" | "name" | "role" | "planId", string>>;

export function validateSignIn(input: { email: string; password: string }) {
  const errors: AuthFormErrors = {};
  if (!input.email.includes("@")) errors.email = "Enter a valid email address.";
  if (input.password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
}

export function validateSignUp(input: {
  email: string;
  password: string;
  name: string;
  role: string;
}) {
  const errors: AuthFormErrors = validateSignIn(input);
  if (input.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!USER_ROLES.includes(input.role as never) || input.role === "admin") {
    errors.role = "Choose a translator or company role.";
  }
  return errors;
}

