'use client';

import * as React from 'react';
import { sendOffer } from '@/app/actions/offers';
import { useRouter, useParams } from 'next/navigation';
import { 
  DollarSign, Calendar, FileText, 
  Send, ChevronLeft, Loader2, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function MakeOfferPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const jobId = params.id as string;
  const appId = params.appId as string;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      price: parseFloat(formData.get('price') as string),
      deadline: formData.get('deadline') as string,
      terms: formData.get('terms') as string,
    };

    const res = await sendOffer(appId, data);
    if (res.success) {
      router.push(`/dashboard/company/jobs/${jobId}`);
    } else {
      setError(res.error || 'Failed to send offer');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <Link 
          href={`/dashboard/company/jobs/${jobId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Applications
        </Link>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-outfit">Make Official Offer</h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">Define your terms and invite the translator to start working.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[var(--accent)]" />
                Final Price (USD)
              </label>
              <input
                name="price"
                type="number"
                required
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] px-5 py-4 text-sm focus:border-[var(--accent)] focus:outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--accent)]" />
                Delivery Deadline
              </label>
              <input
                name="deadline"
                type="date"
                required
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] px-5 py-4 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--accent)]" />
              Special Terms / Requirements
            </label>
            <textarea
              name="terms"
              rows={4}
              required
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] px-5 py-4 text-sm focus:border-[var(--accent)] focus:outline-none resize-none"
              placeholder="Specify milestones, quality standards, or specific instructions..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 font-bold bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[var(--accent)] px-8 py-5 text-sm font-black text-white shadow-2xl shadow-[var(--accent)]/30 hover:bg-[var(--hover)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              Send Official Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
