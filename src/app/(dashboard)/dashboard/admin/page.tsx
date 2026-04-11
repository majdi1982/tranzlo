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
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-6 flex flex-col gap-2">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[var(--accent)]">Tranzlo.</h2>
          <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/30 dark:text-red-400">
            Admin Panel
          </span>
        </div>

        <Link href="/dashboard/admin" className="flex items-center gap-3 text-[var(--accent)] font-medium p-3 rounded-xl bg-[var(--accent)]/10">
          <LayoutDashboard className="h-5 w-5" /> Overview
        </Link>
        <Link href="/dashboard/admin/users" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">
          <Users className="h-5 w-5" /> Users
        </Link>
        <Link href="/dashboard/admin/jobs" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">
          <Briefcase className="h-5 w-5" /> Jobs
        </Link>
        <Link href="/dashboard/admin/verifications" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">
          <ShieldCheck className="h-5 w-5" /> Verifications
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
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
      </main>
    </div>
  );
}
