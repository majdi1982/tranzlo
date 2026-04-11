import Link from 'next/link';
import { Check } from 'lucide-react';
import { initiateSubscription } from '@/app/actions/payments';

export default function PricingPage() {
  return (
    <div className="py-24 sm:py-32 bg-[var(--bg-main)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-[var(--text-secondary)]">
            Choose the plan that fits your needs. 14-day free trial on Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          
          {/* Translator Pricing */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">For Translators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Basic</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-[var(--text-primary)]">
                  $0
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/mo</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">For getting started.</p>
                <ul className="mt-6 space-y-4 flex-1">
                  {['Public profile', '5 applications/mo', 'Basic chat support'].map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)]">
                      <Check className="h-5 w-5 flex-none text-[var(--accent)]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?role=translator&plan=free" className="mt-8 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-center text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">Sign up for Free</Link>
              </div>
              {/* Pro Plan */}
              <div className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--bg-secondary)] p-8 shadow-md relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">Recommended</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pro</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-[var(--text-primary)]">
                  $12
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/mo</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">For professionals.</p>
                <ul className="mt-6 space-y-4 flex-1">
                  {['Priority visibility', 'Unlimited applications', 'CV exposure controls', 'Advanced alerts'].map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)]">
                      <Check className="h-5 w-5 flex-none text-[var(--accent)]" /> {feature}
                    </li>
                  ))}
                </ul>
                <form action={initiateSubscription}>
                  <input type="hidden" name="plan" value="translator_pro" />
                  <button type="submit" className="mt-8 block w-full rounded-xl bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[var(--hover)] transition-all shadow-sm">Start 14-day trial</button>
                </form>
              </div>
            </div>
          </div>

          {/* Company Pricing */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">For Companies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Basic</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-[var(--text-primary)]">
                  $0
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/mo</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">Post occasional jobs.</p>
                <ul className="mt-6 space-y-4 flex-1">
                  {['Company profile', '2 active job posts', 'Limited shortlisting', 'Standard support'].map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)]">
                      <Check className="h-5 w-5 flex-none text-[var(--accent)]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?role=company&plan=free" className="mt-8 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-center text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">Sign up for Free</Link>
              </div>
              {/* Pro Plan */}
              <div className="rounded-2xl border-2 border-indigo-500 bg-[var(--bg-secondary)] p-8 shadow-md relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">Most Popular</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pro</h3>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-[var(--text-primary)]">
                  $49
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/mo</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">Hire at scale.</p>
                <ul className="mt-6 space-y-4 flex-1">
                  {['Unlimited active jobs', 'Advanced candidate filter', 'Featured job boosts', 'Dedicated account routing'].map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)]">
                      <Check className="h-5 w-5 flex-none text-indigo-500" /> {feature}
                    </li>
                  ))}
                </ul>
                <form action={initiateSubscription}>
                  <input type="hidden" name="plan" value="company_pro" />
                  <button type="submit" className="mt-8 block w-full rounded-xl bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-600 transition-all shadow-sm">Start 14-day trial</button>
                </form>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
