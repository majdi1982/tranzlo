'use client';

import * as React from 'react';
import { applyForJob } from '@/app/actions/applications';

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
}

export default function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    formData.append('jobId', jobId);
    const result = await applyForJob(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800/50 dark:bg-emerald-900/20">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Proposal Submitted!</h3>
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
          Your application for <strong>{jobTitle}</strong> has been sent to the company. You&apos;ll be notified when they respond.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="proposedPrice" className="block text-sm font-semibold text-[var(--text-primary)]">
          Your Rate <span className="font-normal text-[var(--text-secondary)]">(USD)</span>
        </label>
        <div className="relative mt-2">
          <span className="absolute inset-y-0 left-4 flex items-center text-[var(--text-secondary)] font-medium text-sm pointer-events-none">$</span>
          <input
            type="number"
            id="proposedPrice"
            name="proposedPrice"
            required
            min="1"
            step="0.01"
            placeholder="0.00"
            className="block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] pl-8 pr-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="coverLetter" className="block text-sm font-semibold text-[var(--text-primary)]">
          Cover Letter
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          required
          rows={5}
          placeholder="Introduce yourself and explain why you are the best fit for this project..."
          className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-4 text-sm font-bold text-white shadow-sm hover:bg-[var(--hover)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Submitting Proposal...
          </span>
        ) : (
          'Submit Proposal'
        )}
      </button>
    </form>
  );
}
