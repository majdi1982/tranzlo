import type { LucideIcon } from "lucide-react";
import { 
  LayoutDashboard, 
  Globe, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  Users, 
  CreditCard,
  History,
  ShieldCheck
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
};

export const publicNav: NavItem[] = [
  { name: "Marketplace", href: "/marketplace" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export const translatorNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard/translator", icon: LayoutDashboard },
  { name: "Available Jobs", href: "/jobs", icon: Briefcase },
  { name: "My Assignments", href: "/my-assignments", icon: History },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Wallet", href: "/wallet", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const companyNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard/company", icon: LayoutDashboard },
  { name: "Post a Job", href: "/post-job", icon: Globe },
  { name: "Active Projects", href: "/projects", icon: Briefcase },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Job Audit", href: "/admin/jobs", icon: ShieldCheck },
  { name: "Financials", href: "/admin/finance", icon: CreditCard },
  { name: "Site Config", href: "/admin/config", icon: Settings },
];
