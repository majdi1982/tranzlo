import { createAdminClient } from '@/lib/server/appwrite';
import { deleteJob } from '@/app/actions/admin';
import { Trash2 } from 'lucide-react';

export default async function AdminJobsPage() {
  let jobs: any[] = [];
  let total = 0;

  try {
    const { databases } = await createAdminClient();
    const dbId = '69da165d00335f7a350e';
    const res = await databases.listDocuments(dbId, 'jobs');
    jobs = res.documents;
    total = res.total;
  } catch (err) {
    console.error('Could not fetch jobs', err);
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-6 flex flex-col gap-2">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[var(--accent)]">Tranzlo.</h2>
          <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/30 dark:text-red-400">Admin Panel</span>
        </div>
        <a href="/dashboard/admin" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">Overview</a>
        <a href="/dashboard/admin/users" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">Users</a>
        <a href="/dashboard/admin/jobs" className="flex items-center gap-3 text-[var(--accent)] font-medium p-3 rounded-xl bg-[var(--accent)]/10">Jobs</a>
        <a href="/dashboard/admin/verifications" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">Verifications</a>
      </aside>

      <main className="flex-1 p-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Job Moderation</h1>
          <p className="text-[var(--text-secondary)] mt-1">{total} total jobs across the platform.</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Languages</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">No jobs found.</td>
                </tr>
              ) : jobs.map((job) => (
                <tr key={job.$id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)] max-w-xs truncate">{job.jobTitle}</td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] capitalize">{job.serviceType}</td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">{job.sourceLanguage} → {job.targetLanguages?.join(', ')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
                      ${job.status === 'published' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 ring-amber-600/20'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteJob.bind(null, job.$id) as any}>
                      <button type="submit" className="flex items-center gap-1 ml-auto rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
