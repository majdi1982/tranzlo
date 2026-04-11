'use client';

import * as React from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsPending(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Log in to your Tranzlo account
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">Email address</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            required
            className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-sm placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]" 
            placeholder="you@example.com" 
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            required
            className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-sm placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]" 
            placeholder="••••••••" 
          />
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover)] transition-colors mt-6 disabled:opacity-70"
        >
          {isPending ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-[var(--accent)] hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
