import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, Languages, ShieldCheck, Sparkles, Users, Wallet, Workflow, Headphones, ChartNoAxesCombined } from "lucide-react";

export const publicNavItems = [
  { name: "Marketplace", href: "/marketplace" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export const highlights: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Verified work", description: "Profiles, jobs, and billing live in one trustable system.", icon: ShieldCheck },
  { title: "Role-specific flows", description: "Translator and company journeys stay cleanly separated.", icon: Workflow },
  { title: "Production ready", description: "Webhooks, env safety, and VPS deployment notes are built in.", icon: Sparkles },
];

export const features = [
  "Role-based onboarding",
  "Subscription gating",
  "Job and application tracking",
  "Support ticket foundation",
  "Appwrite and PayPal integration",
  "n8n automation hooks",
];

export const stats = [
  { label: "Translation roles", value: "Translator + Company" },
  { label: "Automation layers", value: "Appwrite + n8n" },
  { label: "Billing", value: "PayPal subscriptions" },
];

export const pricingCards = [
  {
    title: "Translator Basic",
    price: "$0",
    description: "Start with a simple profile and apply to jobs as you grow.",
  },
  {
    title: "Translator Pro",
    price: "$19",
    description: "Unlock better visibility, more signals, and subscription perks.",
  },
  {
    title: "Company Pro",
    price: "$49",
    description: "Post jobs, review candidates, and manage hiring workflows.",
  },
];

export const marketplaceCalls = [
  "Find vetted translators",
  "Post and manage jobs",
  "Track applications and outcomes",
  "Review billing and support history",
];

