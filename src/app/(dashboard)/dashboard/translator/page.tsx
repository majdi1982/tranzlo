import * as React from 'react';
import Link from 'next/link';
import { createAdminClient, createSessionClient } from '@/lib/server/appwrite';
import { LayoutDashboard, FileText, Settings, Wallet, Bell } from 'lucide-react';
import { Query } from 'node-appwrite';

import { DashboardSidebar } from '@/components/DashboardSidebar';

export default async function TranslatorDashboardPage() {
  let myApplications: any[] = [];
  let userName = "Translator";
  
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    userName = user.name;

    const { databases } = await createAdminClient();
    const dbId = '69da165d00335f7a350e';
    
    const res = await databases.listDocuments(dbId, 'job_applications', [
      Query.equal('translatorId', user.$id)
    ]);
    myApplications = res.documents;
  } catch (err) {
    console.error('Could not fetch translator data', err);
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      <DashboardSidebar role="translator" />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 pb-32 md:pb-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Welcome back, {userName}</h1>
            <p className="text-[var(--text-secondary)] mt-1">Here is what is happening with your freelance business.</p>
          </div>
          <div className="flex gap-4">
             <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors relative">
               <Bell className="h-5 w-5" />
               <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Available Balance</h3>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">$0.00</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Active Proposals</h3>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{myApplications.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Profile Views</h3>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">12</p>
          </div>
        </div>

        {/* Applications List */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Recent Applications</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
            {myApplications.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-secondary)]">
                You haven&apos;t submitted any proposals yet.
                <div className="mt-4">
                  <Link href="/jobs" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--hover)] transition-all">
                    Browse Jobs
                  </Link>
                </div>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Job ID</th>
                    <th className="px-6 py-4 font-semibold">Proposed Price</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {myApplications.map((app) => (
                    <tr key={app.$id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{app.jobId}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">${app.proposedPrice}</td>
                      <td className="px-6 py-4">
                         <span className="inline-flex rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">View details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
