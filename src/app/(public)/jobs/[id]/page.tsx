import { createAdminClient } from '@/lib/server/appwrite';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Globe, Clock, ArrowLeft, CheckCircle,
  Languages, Briefcase, BarChart3, Building2
} from 'lucide-react';
import ApplyForm from './apply-form';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const { databases } = await createAdminClient();
    const dbId = '69da165d00335f7a350e';
    const job = await databases.getDocument(
      dbId,
      'jobs',
      id
    );
    return {
      title: `${job.jobTitle} | Tranzlo`,
      description: job.description?.slice(0, 160),
    };
  } catch {
    return { title: 'Job Not Found | Tranzlo' };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  let job: any = null;

  try {
    const { databases } = await createAdminClient();
    const dbId = '69da165d00335f7a350e';
    job = await databases.getDocument(
      dbId,
      'jobs',
      id
    );
  } catch {
    notFound();
  }

  const postedDate = new Date(job.$createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to all jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ─── Left: Job Detail ────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset mb-3
                    ${job.serviceType === 'translation' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400' :
                      job.serviceType === 'proofreading' ? 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-900/30 dark:text-violet-400' :
                      'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {job.serviceType}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-tight">
                    {job.jobTitle}
                  </h1>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset shrink-0
                  ${job.status === 'published' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 ring-gray-500/20'}`}>
                  {job.status === 'published' ? '● Open' : job.status}
                </span>
              </div>

              {/* Meta Row */}
              <div className="mt-6 flex flex-wrap gap-5 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-[var(--accent)]" />
                  <span className="font-medium text-[var(--text-primary)]">{job.sourceLanguage}</span>
                  <span className="mx-1">→</span>
                  <span className="font-medium text-[var(--text-primary)]">{job.targetLanguages?.join(', ')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> Remote
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Posted {postedDate}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Job Description</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">What we are looking for</h2>
              <ul className="space-y-3">
                {[
                  `Native or near-native proficiency in ${job.targetLanguages?.[0] || 'target language'}`,
                  `Professional experience in ${job.serviceType}`,
                  `Strong attention to detail and cultural nuance`,
                  `Ability to meet agreed deadlines`,
                  `Portfolio or sample work preferred`,
                ].map((req) => (
                  <li key={req} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ─── Right: Apply Sidebar ─────────────────────── */}
          <div className="space-y-6">

            {/* Apply Box */}
            <div className="sticky top-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">Submit a Proposal</h2>
              <ApplyForm jobId={job.$id} jobTitle={job.jobTitle} />
              <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
                By applying you agree to our{' '}
                <Link href="/legal/terms" className="text-[var(--accent)] hover:underline">Terms</Link>.
              </p>
            </div>

            {/* Job Snapshot */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Job Snapshot</h3>
              <ul className="space-y-4">
                {[
                  { icon: Briefcase, label: 'Service Type', value: job.serviceType },
                  { icon: Languages, label: 'Source Language', value: job.sourceLanguage || '—' },
                  { icon: Globe, label: 'Target Language', value: job.targetLanguages?.join(', ') || '—' },
                  { icon: Hash, label: 'Word Count', value: job.wordCount ? `${job.wordCount.toLocaleString()} words` : '—' },
                  { icon: Coins, label: 'Budget', value: job.budgetAmount ? `${job.budgetAmount} ${job.budgetType === 'hourly' ? '/ hr' : '(Fixed)'}` : '—' },
                  { icon: Clock, label: 'Deadline', value: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No urgent deadline' },
                  { icon: Building2, label: 'Workspace', value: job.workMode || 'Remote' },
                ].map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Icon className="h-4 w-4" /> {label}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] capitalize">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
