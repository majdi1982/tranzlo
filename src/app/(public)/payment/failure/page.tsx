import Link from 'next/link';
import { XCircle } from 'lucide-react';

interface Props {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function PaymentFailurePage({ searchParams }: Props) {
  const { order_id } = await searchParams;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[var(--bg-main)] px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6 ring-8 ring-red-50 dark:ring-red-900/10">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Payment Unsuccessful</h1>
      <p className="mt-4 text-[var(--text-secondary)] max-w-md">
        Your payment could not be processed. You have not been charged. Please check your details and try again, or contact our support team.
      </p>
      <div className="mt-8 flex gap-4 flex-wrap justify-center">
        <Link
          href="/pricing"
          className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--hover)] transition-all"
        >
          Try Again
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
        >
          Contact Support
        </Link>
      </div>
      {order_id && (
        <p className="mt-8 text-xs text-[var(--text-secondary)]">
          Reference: <code className="font-mono">{order_id}</code>
        </p>
      )}
    </div>
  );
}
