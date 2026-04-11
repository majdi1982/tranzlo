import * as React from 'react';
import { createSessionClient } from '@/lib/server/appwrite';
import { Query } from 'node-appwrite';
import Link from 'next/link';
import { 
  ChevronLeft, Users, FileText, 
  Clock, CheckCircle, ExternalLink 
} from 'lucide-react';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobDetailReviewPage({ params }: Props) {
  const { id } = await params;

  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    const job = await databases.getDocument(dbId, 'jobs', id);

    if (job.userId !== user.$id) {
       notFound();
    }

    // Fetch applications for this job
    const appResponse = await databases.listDocuments(dbId, 'applications', [
      Query.equal('jobId', id),
      Query.orderDesc('$createdAt')
    ]);
    const applications = appResponse.documents;

    return (
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
        <div className="mb-8">
          <Link 
            href="/dashboard/company/jobs" 
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Job Postings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Job Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{job.jobTitle}</h1>
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 mb-6">
                Status: {job.status}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Clock className="h-4 w-4" />
                  <span>Posted {new Date(job.$createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Users className="h-4 w-4" />
                  <span>{applications.length} Applications</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Service Type</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium capitalize">{job.serviceType?.replace('_', ' ') || 'Translation'}</p>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
              Translator Applications
            </h2>

            {applications.length > 0 ? (
              applications.map((app) => (
                <div 
                  key={app.$id}
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 transition-all hover:bg-[var(--bg-main)]"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                        {app.translatorName?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{app.translatorName}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Applied {new Date(app.$createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Proposed Price</p>
                      <p className="text-lg font-black text-[var(--text-primary)]">${app.proposedPrice}</p>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-main)]/50 rounded-2xl p-6 mb-6">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic line-clamp-3">
                      &quot;{app.coverLetter}&quot;
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link 
                      href={`/translators/${app.translatorId}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all bg-[var(--bg-main)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Portfolio
                    </Link>
                    
                    {app.status === 'accepted' ? (
                       <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Hired
                       </span>
                    ) : app.status === 'offer_sent' ? (
                       <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold">
                          Offer Pending
                       </span>
                    ) : (
                      <Link 
                        href={`/dashboard/company/jobs/${id}/applications/${app.$id}/offer`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-xs font-bold text-white shadow-lg shadow-[var(--accent)]/10 hover:bg-[var(--hover)] hover:scale-[1.05] transition-all"
                      >
                        Make Official Offer
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl">
                <Users className="h-10 w-10 text-[var(--text-secondary)]/20 mx-auto mb-4" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No applications received yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Job details error', error);
    notFound();
  }
}
