'use client';

import * as React from 'react';
import { acceptOffer } from '@/app/actions/offers';
import { useRouter, useParams } from 'next/navigation';
import { 
  CheckCircle, XCircle, DollarSign, 
  Calendar, FileText, ChevronLeft, 
  Loader2, AlertCircle, PartyPopper 
} from 'lucide-react';
import Link from 'next/link';

export default function ReviewOfferPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [application, setApplication] = React.useState<any>(null);

  const appId = params.appId as string;

  React.useEffect(() => {
    async function loadApp() {
      const { getApplication } = await import('@/app/actions/applications');
      const app = await getApplication(appId);
      setApplication(app);
      setLoading(false);
    }
    loadApp();
  }, [appId]);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    const res = await acceptOffer(appId);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/translator'), 3000);
    } else {
      setError(res.error || 'Failed to accept offer');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8 animate-bounce">
          <PartyPopper className="h-12 w-12 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-black text-[var(--text-primary)] mb-4">Congratulations!</h1>
        <p className="text-xl text-[var(--text-secondary)] font-medium">You&apos;ve accepted the offer. The project is now officially starting.</p>
        <p className="mt-8 text-sm text-[var(--text-secondary)]">Redirecting you to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <Link 
          href="/dashboard/translator"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Applications
        </Link>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-500" />
        
        <div className="p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-black text-[var(--text-primary)] font-outfit">Review Official Offer</h1>
              <p className="text-[var(--text-secondary)] mt-1 font-medium italic">A formal proposal for your services.</p>
            </div>
            <div className="px-6 py-2 rounded-2xl bg-blue-100 text-blue-700 font-black text-xs uppercase tracking-widest shadow-sm border border-blue-200">
              Contract Pending
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[var(--bg-main)]/50 rounded-2xl p-6 border border-[var(--border)] shadow-inner">
              <div className="flex items-center gap-3 text-[var(--accent)] mb-3">
                <DollarSign className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Offered Price</span>
              </div>
              <p className="text-3xl font-black text-[var(--text-primary)]">
                ${application?.offeredPrice || application?.proposedPrice || '0'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Fixed price for milestones</p>
            </div>
            <div className="bg-[var(--bg-main)]/50 rounded-2xl p-6 border border-[var(--border)] shadow-inner">
              <div className="flex items-center gap-3 text-[var(--accent)] mb-3">
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Delivery Date</span>
              </div>
              <p className="text-3xl font-black text-[var(--text-primary)]">
                {application?.offeredDeadline ? new Date(application.offeredDeadline).toLocaleDateString() : 'TBD'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Expected final delivery</p>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--accent)]" />
              Contract Terms & Scope
            </h3>
            <div className="bg-[var(--bg-main)] rounded-2xl p-8 border border-[var(--border)] prose dark:prose-invert max-w-none text-sm leading-relaxed text-[var(--text-secondary)]">
              {application?.offerTerms ? (
                <p className="whitespace-pre-wrap">{application.offerTerms}</p>
              ) : (
                <>
                  <p>The company has specified the following requirements and terms for this job. Accepting this offer initiates a binding project agreement.</p>
                  <ul className="mt-4 space-y-2">
                    <li>• Adherence to project-specific quality guidelines.</li>
                    <li>• Timely delivery of translation assets.</li>
                    <li>• Confidentiality and data protection standards.</li>
                  </ul>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-8 flex items-center gap-2 text-sm text-red-500 font-bold bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-8 py-5 text-sm font-black text-white shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              Accept Official Offer
            </button>
            <button
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] px-8 py-5 text-sm font-black text-[var(--text-primary)] hover:border-red-500 hover:text-red-500 transition-all hover:bg-red-50/50"
            >
              <XCircle className="h-5 w-5" />
              Decline Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
