'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, CheckCircle2 } from 'lucide-react';
import PayPalButton from '@/components/PayPalButton';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const [trialActivated, setTrialActivated] = React.useState(false);

  const plans = {
    translator: {
      free: {
        name: 'Basic',
        price: 0,
        description: 'For getting started.',
        features: ['Public profile', '5 applications/mo', 'Basic chat support'],
        link: '/signup?role=translator&plan=free'
      },
      pro: {
        name: 'Pro',
        monthlyPrice: 12,
        yearlyPrice: 120,
        description: 'For professionals.',
        features: ['Priority visibility', 'Unlimited applications', 'CV exposure controls', 'Advanced alerts'],
        planIds: {
          monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_MONTHLY || 'P-1FA07072XD6828721NHNGB6I',
          yearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_YEARLY || 'P-5H654170A9572811WNHNGK3Q'
        }
      }
    },
    company: {
      free: {
        name: 'Basic',
        price: 0,
        description: 'Post occasional jobs.',
        features: ['Company profile', '2 active job posts', 'Limited shortlisting', 'Standard support'],
        link: '/signup?role=company&plan=free'
      },
      pro: {
        name: 'Pro',
        monthlyPrice: 49,
        yearlyPrice: 490,
        description: 'Hire at scale.',
        features: ['Unlimited active jobs', 'Advanced candidate filter', 'Featured job boosts', 'Dedicated account routing'],
        planIds: {
          monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_COMPANY_MONTHLY || 'P-1FA07072XD6828721NHNGB6I', // Placeholder
          yearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_COMPANY_YEARLY || 'P-1FA07072XD6828721NHNGB6I' // Placeholder
        }
      }
    }
  };

  const handlePayPalSuccess = () => {
    setTrialActivated(true);
    setTimeout(() => router.push('/dashboard'), 3000);
  };

  if (trialActivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center p-12 max-w-lg">
          <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4">Subscription Activated!</h1>
          <p className="text-[var(--text-secondary)]">Your Pro account is ready. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 sm:py-32 bg-[var(--bg-main)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-6xl font-outfit">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Choose the plan that fits your needs. All Pro plans include a <span className="text-[var(--accent)] font-bold">14-day free trial</span>.
          </p>

          {/* Billing Toggle */}
          <div className="mt-12 flex justify-center items-center gap-4">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 rounded-full bg-[var(--border)] p-1 transition-colors hover:bg-[var(--accent)]"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
              Yearly <span className="ml-1 text-[var(--accent)] text-xs font-black px-1.5 py-0.5 bg-[var(--accent)]/10 rounded-md">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8">
          
          {/* ─────── Translators ───────────────────────── */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-1 bg-[var(--accent)] rounded-full" />
              <h2 className="text-2xl font-black text-[var(--text-primary)]">For Translators</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Basic */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 flex flex-col hover:border-[var(--accent)] transition-all group">
                <h3 className="text-lg font-black text-[var(--text-primary)]">{plans.translator.free.name}</h3>
                <div className="mt-4 flex items-baseline text-4xl font-black text-[var(--text-primary)]">
                  $0
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/mo</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{plans.translator.free.description}</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {plans.translator.free.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)] font-medium">
                      <Check className="h-5 w-5 flex-none text-[var(--accent)]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plans.translator.free.link} className="mt-8 block w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-center text-sm font-black text-[var(--text-primary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all">
                  Join for Free
                </Link>
              </div>

              {/* Pro */}
              <div className="rounded-3xl border-2 border-[var(--accent)] bg-[var(--bg-secondary)] p-8 flex flex-col shadow-2xl shadow-[var(--accent)]/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3">
                  <span className="bg-[var(--accent)] text-white text-[10px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-tighter">Recommended</span>
                </div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">{plans.translator.pro.name}</h3>
                <div className="mt-4 flex items-baseline text-4xl font-black text-[var(--text-primary)]">
                  ${billingCycle === 'monthly' ? plans.translator.pro.monthlyPrice : plans.translator.pro.yearlyPrice}
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)] font-medium">{plans.translator.pro.description}</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {plans.translator.pro.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)] font-medium">
                      <Check className="h-5 w-5 flex-none text-[var(--accent)]" /> {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-10">
                  <PayPalButton 
                    planId={billingCycle === 'monthly' ? plans.translator.pro.planIds.monthly : plans.translator.pro.planIds.yearly} 
                    onSuccess={handlePayPalSuccess}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─────── Companies ─────────────────────────── */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-1 bg-indigo-500 rounded-full" />
              <h2 className="text-2xl font-black text-[var(--text-primary)]">For Companies</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Basic */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 flex flex-col hover:border-indigo-500 transition-all group">
                <h3 className="text-lg font-black text-[var(--text-primary)]">{plans.company.free.name}</h3>
                <div className="mt-4 flex items-baseline text-4xl font-black text-[var(--text-primary)]">
                  $0
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/mo</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{plans.company.free.description}</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {plans.company.free.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)] font-medium">
                      <Check className="h-5 w-5 flex-none text-indigo-500" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plans.company.free.link} className="mt-8 block w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-center text-sm font-black text-[var(--text-primary)] group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all">
                  Join for Free
                </Link>
              </div>

              {/* Pro */}
              <div className="rounded-3xl border-2 border-indigo-500 bg-[var(--bg-secondary)] p-8 flex flex-col shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3">
                  <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-tighter">Enterprise Mode</span>
                </div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">{plans.company.pro.name}</h3>
                <div className="mt-4 flex items-baseline text-4xl font-black text-[var(--text-primary)]">
                  ${billingCycle === 'monthly' ? plans.company.pro.monthlyPrice : plans.company.pro.yearlyPrice}
                  <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)] font-medium">{plans.company.pro.description}</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {plans.company.pro.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 text-sm text-[var(--text-secondary)] font-medium">
                      <Check className="h-5 w-5 flex-none text-indigo-500" /> {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <PayPalButton 
                    planId={billingCycle === 'monthly' ? plans.company.pro.planIds.monthly : plans.company.pro.planIds.yearly} 
                    onSuccess={handlePayPalSuccess}
                  />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* FAQ Section Placeholder */}
        <div className="mt-32 text-center pt-20 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] font-medium">Looking for a custom plan? <Link href="/contact" className="text-[var(--accent)] font-bold">Contact our sales team</Link></p>
        </div>

      </div>
    </div>
  );
}
