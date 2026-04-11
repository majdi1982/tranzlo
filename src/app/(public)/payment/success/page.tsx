import { confirmPayment } from '@/app/actions/payments';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { order_id } = await searchParams;

  let confirmed = false;
  let errorMsg: string | null = null;

  if (order_id) {
    const result = await confirmPayment(order_id);
    confirmed = result.success;
    errorMsg = result.error || null;
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[var(--bg-main)] px-4 text-center">
      {confirmed ? (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Payment Confirmed!</h1>
          <p className="mt-4 text-[var(--text-secondary)] max-w-md">
            Your Pro subscription is now active. Welcome to the full Tranzlo experience — your profile will be prioritized across the platform.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/dashboard/translator"
              className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--hover)] transition-all"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/jobs"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
            >
              Browse Jobs
            </Link>
          </div>
          <p className="mt-6 text-xs text-[var(--text-secondary)]">
            Order ID: <code className="font-mono">{order_id}</code>
          </p>
        </>
      ) : (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6 ring-8 ring-red-50 dark:ring-red-900/10">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Could not confirm payment</h1>
          <p className="mt-4 text-[var(--text-secondary)] max-w-md">
            {errorMsg || 'We could not verify your payment. If you were charged, please contact support with your Order ID.'}
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/pricing" className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--hover)] transition-all">
              Try Again
            </Link>
            <Link href="/contact" className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-all">
              Contact Support
            </Link>
          </div>
          {order_id && (
            <p className="mt-6 text-xs text-[var(--text-secondary)]">
              Order ID: <code className="font-mono">{order_id}</code>
            </p>
          )}
        </>
      )}
    </div>
  );
}
