import * as React from 'react';
import { createSessionClient } from '@/lib/server/appwrite';
import { Query } from 'node-appwrite';
import Link from 'next/link';
import { 
  Plus, Briefcase, Users, Clock, 
  ChevronRight, Globe, Search 
} from 'lucide-react';

export default async function CompanyJobsPage() {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    
    // Fetch jobs created by this company
    const response = await databases.listDocuments(dbId, 'jobs', [
      Query.equal('userId', user.$id),
      Query.orderDesc('$createdAt')
    ]);

    const jobs = response.documents;

    return (
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-outfit">My Job Postings</h1>
            <p className="text-[var(--text-secondary)] mt-2 font-medium">Manage your active projects and review applications.</p>
          </div>
          <Link
            href="/dashboard/company/jobs/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 hover:bg-[var(--hover)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-5 w-5" />
            Post New Job
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <Link
                key={job.$id}
                href={`/dashboard/company/jobs/${job.$id}`}
                className="group relative flex flex-col md:flex-row items-start md:items-center gap-6 p-8 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl transition-all hover:bg-[var(--bg-main)] hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-[var(--accent)]/10"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-110 transition-transform">
                  <Briefcase className="h-8 w-8" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">{job.jobTitle}</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      job.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
                      <Clock className="h-4 w-4 text-[var(--accent)]" />
                      {new Date(job.$createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
                      <Users className="h-4 w-4 text-[var(--accent)]" />
                      Applications: {job.applicationCount || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  <div className="hidden sm:flex flex-col items-end text-right mr-4">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tighter">Budget range</p>
                    <p className="text-sm font-black text-[var(--text-primary)]">$500 - $1,500</p>
                  </div>
                  <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-transparent border border-[var(--border)] text-[var(--text-secondary)] group-hover:bg-[var(--accent)] group-hover:border-transparent group-hover:text-white transition-all">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl text-center p-8">
            <div className="h-20 w-20 rounded-full bg-[var(--bg-main)] flex items-center justify-center mb-6 ring-8 ring-[var(--bg-main)]/50">
              <Search className="h-8 w-8 text-[var(--text-secondary)]/30" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">No jobs posted yet</h3>
            <p className="text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              Ready to find the perfect professional translator? Start by creating your first job posting.
            </p>
            <Link 
              href="/dashboard/company/jobs/new" 
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.05] transition-all"
            >
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Job list fetch error', error);
    return <div>Error loading jobs. Please try again.</div>;
  }
}
