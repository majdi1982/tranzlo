import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function JobNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[var(--bg-main)] px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] mb-6">
        <SearchX className="h-10 w-10 text-[var(--text-secondary)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Job not found</h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--text-secondary)]">
        This job may have been filled, removed, or the link is incorrect.
      </p>
      <Link
        href="/jobs"
        className="mt-8 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--hover)] transition-all"
      >
        Browse all open jobs
      </Link>
    </div>
  );
}
