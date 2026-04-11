'use client';

import * as React from 'react';
import Link from 'next/link';
import { signup } from '@/app/actions/auth';

export default function SignupPage() {
  const [role, setRole] = React.useState<'translator' | 'company'>('translator');
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    formData.append('role', role);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsPending(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Create your account</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Join Tranzlo today and connect globally
        </p>
      </div>

      <div className="mb-6 flex rounded-xl border border-[var(--border)] p-1 bg-[var(--bg-main)]">
        <button
          onClick={() => setRole('translator')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            role === 'translator' 
              ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          I am a Translator
        </button>
        <button
          onClick={() => setRole('company')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            role === 'company' 
              ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          I am Hiring
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)]">Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            required
            className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-sm placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]" 
            placeholder="John Doe" 
          />
        </div>

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
            minLength={8}
            className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-sm placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]" 
            placeholder="••••••••" 
          />
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover)] transition-colors mt-6 disabled:opacity-70"
        >
          {isPending ? 'Creating Account...' : `Create ${role === 'translator' ? 'Translator' : 'Company'} Account`}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
