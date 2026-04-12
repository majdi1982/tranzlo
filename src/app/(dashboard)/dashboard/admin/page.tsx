import * as React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/server/appwrite';
import {
  LayoutDashboard, Users, Briefcase, ShieldCheck,
  AlertTriangle, CheckCircle, XCircle, Activity
} from 'lucide-react';

async function getStats() {
  try {
    const { databases, users } = await createAdminClient();
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    const [jobsRes, usersRes] = await Promise.all([
      databases.listDocuments(dbId, 'jobs'),
      users.list(),
    ]);
    return {
      totalJobs: jobsRes.total,
      totalUsers: usersRes.total,
    };
  } catch {
    return { totalJobs: 0, totalUsers: 0 };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Overview</h1>
        <p className="text-[var(--text-secondary)] mt-1">Platform health, moderation queue, and key metrics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Pending Verifications', value: 0, icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Flagged Content', value: 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">{label}</h3>
                <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--accent)]" /> Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Verify a Translator', href: '/dashboard/admin/verifications', icon: CheckCircle, color: 'text-emerald-500' },
              { label: 'Moderate Jobs', href: '/dashboard/admin/jobs', icon: Briefcase, color: 'text-blue-500' },
              { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users, color: 'text-indigo-500' },
              { label: 'View Flagged Posts', href: '/dashboard/admin/jobs?filter=flagged', icon: XCircle, color: 'text-red-500' },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" /> Recent Verifications
          </h2>
          <div className="flex flex-col items-center justify-center py-10 text-center text-[var(--text-secondary)]">
            <ShieldCheck className="h-12 w-12 opacity-30 mb-3" />
            <p className="text-sm">No pending verifications in queue.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
