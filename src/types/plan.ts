import type { PlanTier, TrialStatus } from "./common";

export interface Plan {
  $id: string;
  name: string;
  slug: PlanTier;
  price: number;
  features: string[];
  limits: {
    jobsPerMonth: number;
    applicationsPerMonth: number;
    messagesPerDay: number;
  };
  createdAt: string;
}

export interface Subscription {
  $id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired";
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface Trial {
  userId: string;
  status: TrialStatus;
  startsAt: string;
  endsAt: string;
}
