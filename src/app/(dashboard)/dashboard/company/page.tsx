import * as React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/server/appwrite';
import { Plus, LayoutDashboard, Briefcase, FileText } from 'lucide-react';

export default async function CompanyDashboardPage() {
  // In production, we fetch only jobs associated with the logged-in company user
  let myJobs: any[] = [];
  
  try {
    const { databases } = await createAdminClient();
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    // Using layout from spec
    const res = await databases.listDocuments(dbId, 'jobs');
    myJobs = res.documents;
  } catch (err) {
    console.error('Could not fetch jobs', err);
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-6 flex flex-col space-y-4">
        <h2 className="text-xl font-bold text-[var(--accent)] mb-8">Tranzlo.</h2>
        <Link href="/dashboard/company" className="flex items-center gap-3 text-[var(--text-primary)] font-medium p-3 rounded-xl bg-[var(--hover)]/10 text-[var(--accent)]">
          <LayoutDashboard className="h-5 w-5" /> Dashboard
        </Link>
        <Link href="/dashboard/company/jobs/new" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">
          <Briefcase className="h-5 w-5" /> Post Job
        </Link>
        <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">
          <FileText className="h-5 w-5" /> Applications
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Company Terminal</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your translation requests and track applications.</p>
          </div>
          <Link href="/dashboard/company/jobs/new" className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover)] transition-all">
            <Plus className="h-4 w-4" /> New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Active Jobs</h3>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{myJobs.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Pending Offers</h3>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">0</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Active Expenses</h3>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">$0.00</p>
          </div>
        </div>

        {/* Job List */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Your Posted Jobs</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
            {myJobs.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-secondary)]">
                You haven&apos;t posted any jobs yet.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Job Title</th>
                    <th className="px-6 py-4 font-semibold">Languages</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {myJobs.map((job) => (
                    <tr key={job.$id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{job.jobTitle}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{job.sourceLanguage} {"->"} {job.targetLanguages?.join(', ')}</td>
                      <td className="px-6 py-4">
                         <span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[var(--accent)] hover:underline font-medium">View Applicants</button>
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
