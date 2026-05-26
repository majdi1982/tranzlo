import type { Plan } from "@/types";

export const DEFAULT_PLANS: Plan[] = [
  {
    $id: "plan_free",
    name: "Free",
    slug: "free",
    price: 0,
    features: [
      "Browse projects",
      "Apply to 3 jobs/month",
      "Basic profile",
      "Email support",
    ],
    limits: {
      jobsPerMonth: 0,
      applicationsPerMonth: 3,
      messagesPerDay: 10,
    },
    createdAt: "",
  },
  {
    $id: "plan_starter",
    name: "Starter",
    slug: "starter",
    price: 9.99,
    features: [
      "Apply to 20 jobs/month",
      "Priority support",
      "Profile badge",
      "Advanced filters",
    ],
    limits: {
      jobsPerMonth: 0,
      applicationsPerMonth: 20,
      messagesPerDay: 50,
    },
    createdAt: "",
  },
  {
    $id: "plan_professional",
    name: "Professional",
    slug: "professional",
    price: 29.99,
    features: [
      "Unlimited applications",
      "Verified badge",
      "API access",
      "24/7 support",
      "Analytics dashboard",
    ],
    limits: {
      jobsPerMonth: 0,
      applicationsPerMonth: -1,
      messagesPerDay: 200,
    },
    createdAt: "",
  },
];

export const TRIAL_DAYS = 30;
export const REFUND_WINDOW_DAYS = 7;
