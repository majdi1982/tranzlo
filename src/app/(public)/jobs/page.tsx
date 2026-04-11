import * as React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/server/appwrite';
import { Globe, MapPin, Search } from 'lucide-react';

export const revalidate = 60; // incremental static regeneration

export default async function JobsListingPage() {
  let jobs: any[] = [];
  
  try {
    const { databases } = await createAdminClient();
    const dbId = '69da165d00335f7a350e';
    // Using layout from spec
    const res = await databases.listDocuments(dbId, 'jobs');
    jobs = res.documents as any[];
  } catch (err) {
    console.error('Could not fetch jobs', err);
  }

  return (
    <div className="py-16 bg-[var(--bg-main)] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Header / Search */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">Find jobs</h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl">
            Browse open translation projects and apply directly.
          </p>

          <div className="mt-8 flex max-w-2xl items-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent)]">
            <Search className="h-5 w-5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search by keyword, language, or service..." 
              className="flex-1 bg-transparent border-none px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
            />
            <button className="rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--hover)] transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Listings */}
        <div className="flex flex-col gap-6">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] border-dashed py-24 text-center">
              <Globe className="mx-auto h-12 w-12 text-[var(--text-secondary)] opacity-50" />
              <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">No jobs found</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">There are currently no active jobs matching your criteria.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <Link 
                key={job.$id} 
                href={`/jobs/${job.$id}`}
                className="group flex flex-col sm:flex-row gap-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm hover:border-[var(--accent)] hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {job.jobTitle}
                    </h3>
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20">
                      {job.serviceType}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Remote</span>
                    <span>•</span>
                    <span className="font-medium text-[var(--text-primary)]">{job.sourceLanguage} {"->"} {job.targetLanguages?.join(', ')}</span>
                  </div>
                  <p className="mt-4 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <div className="sm:border-l border-[var(--border)] sm:pl-6 flex flex-col justify-between shrink-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] mb-4 sm:mb-0">
                    Budget: competitive
                  </div>
                  <button className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-6 py-2 text-sm font-semibold text-[var(--text-primary)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-transparent transition-all">
                    Apply Now
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
