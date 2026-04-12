'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, X, CheckCircle2, Star, Zap, Shield, Crown, Globe, HelpCircle } from 'lucide-react';
import PayPalButton from '@/components/PayPalButton';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const [trialActivated, setTrialActivated] = React.useState(false);

  const translatorFeatures = [
    { name: 'Public professional profile', free: true, standard: true, plus: true },
    { name: 'Directory ranking', free: 'Standard', standard: 'Priority', plus: 'Top-tier' },
    { name: 'Job applications', free: '5/mo', standard: 'Unlimited', plus: 'Unlimited + Priority' },
    { name: 'Access to member-only jobs', free: false, standard: true, plus: true },
    { name: 'Trust Board access (Feedback)', free: 'View only', standard: 'Full access', plus: 'Full access' },
    { name: 'Online invoicing system', free: false, standard: true, plus: true },
    { name: 'Profile visitor tracking', free: false, standard: false, plus: true },
    { name: 'Project history builder', free: true, standard: true, plus: true },
    { name: 'Verification of native language', free: false, standard: true, plus: true },
    { name: 'CPD tracking & verification', free: false, standard: true, plus: true },
    { name: 'Software & training discounts', free: false, standard: '10%', plus: '25%' },
    { name: 'Portfolio localization', free: false, standard: '2 languages', plus: 'Unlimited' },
    { name: 'Managed projects eligibility', free: false, standard: false, plus: true },
    { name: 'Industry reports access', free: false, standard: true, plus: true },
  ];

  const businessFeatures = [
    { name: 'Company profile & branding', basic: true, standard: true, enterprise: true },
    { name: 'Job postings', basic: '2 active', standard: 'Unlimited', enterprise: 'Unlimited + Featured' },
    { name: 'Candidate search filters', basic: 'Standard', standard: 'Advanced', enterprise: 'Enterprise AI' },
    { name: 'Mass recruitment messages', basic: '50/msg', standard: '500/msg', enterprise: '1000+/msg' },
    { name: 'Job templates', basic: '2', standard: '8', enterprise: 'Unlimited' },
    { name: 'Managed recruiting assistance', basic: false, standard: false, enterprise: true },
    { name: 'Bulk vendor payments', basic: false, standard: true, enterprise: true },
    { name: 'Trust Board participation', basic: true, standard: true, enterprise: true },
    { name: 'Dedicated Account Manager', basic: false, standard: false, enterprise: true },
    { name: 'API access for ATS/CRM', basic: false, standard: false, enterprise: true },
    { name: 'Custom service agreements', basic: false, standard: true, enterprise: true },
    { name: 'Priority support', basic: 'Standard', standard: 'Priority', enterprise: '24/7 Dedicated' },
  ];

  const translatorPlans = {
    free: {
      name: 'Basic',
      price: 0,
      description: 'Perfect for getting started in the community.',
      features: ['Public profile', '5 applications/mo', 'Project history builder'],
      icon: <Globe className="h-6 w-6 text-blue-500" />,
      link: '/signup?role=translator&plan=free'
    },
    standard: {
      name: 'Standard Pro',
      monthlyPrice: 12,
      yearlyPrice: 120,
      description: 'The standard for professional freelancers.',
      features: ['Priority visibility', 'Unlimited applications', 'Trust Board access', 'Native verification'],
      icon: <Star className="h-6 w-6 text-amber-500" />,
      planIds: {
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_MONTHLY || 'P-1FA07072XD6828721NHNGB6I',
        yearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_YEARLY || 'P-5H654170A9572811WNHNGK3Q'
      }
    },
    plus: {
      name: 'Plus+',
      monthlyPrice: 19,
      yearlyPrice: 190,
      description: 'Maximum exposure and advanced tools.',
      features: ['Top-tier ranking', 'Visitor tracking', 'Managed job priority', '25% discounts'],
      icon: <Crown className="h-6 w-6 text-indigo-500" />,
      planIds: {
        monthly: 'P-1FA07072XD6828721NHNGB6I', // Placeholder
        yearly: 'P-5H654170A9572811WNHNGK3Q' // Placeholder
      }
    }
  };

  const businessPlans = {
    basic: {
      name: 'Basic',
      price: 0,
      description: 'Post jobs and find talent occasionally.',
      features: ['2 active job posts', '50 candidates per message', 'Standard filters'],
      icon: <Zap className="h-6 w-6 text-gray-500" />,
      link: '/signup?role=company&plan=free'
    },
    standard: {
      name: 'Standard Pro',
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: 'Scale your recruitment operations.',
      features: ['Unlimited jobs', '500 candidates per message', 'Bulk payments', '8 templates'],
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      planIds: {
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_COMPANY_MONTHLY || 'P-3C891253S7401732CMWNHNAA',
        yearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_COMPANY_YEARLY || 'P-9BK22164UR652150PMWNHNZI'
      }
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 99,
      yearlyPrice: 990,
      description: 'Dedicated recruitment partnership.',
      features: ['Featured job boosts', 'Dedicated Account Manager', 'Managed assistance', 'ATS Integration'],
      icon: <Crown className="h-6 w-6 text-rose-500" />,
      planIds: {
        monthly: 'P-3C891253S7401732CMWNHNAA', // Placeholder
        yearly: 'P-9BK22164UR652150PMWNHNZI' // Placeholder
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
          <div className="h-24 w-24 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-8 text-emerald-600 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] mb-4 font-outfit">Subscription Activated!</h1>
          <p className="text-[var(--text-secondary)] font-medium">Your premium account is ready. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 sm:py-32 bg-[var(--bg-main)] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        
        {/* Decorative Elements */}
        <div className="absolute top-0 -left-64 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-64 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

        {/* Header */}
        <div className="relative text-center mb-24">
          <h1 className="text-5xl font-black tracking-tight text-[var(--text-primary)] sm:text-7xl font-outfit leading-[1.1]">
            Grow your business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-indigo-500">without limits.</span>
          </h1>
          <p className="mt-8 text-xl text-[var(--text-secondary)] max-w-3xl mx-auto font-medium leading-relaxed">
            Whether you are a professional translator or a global agency, we have the tools you need to succeed. All Pro plans include a <span className="text-[var(--accent)] font-bold">14-day free trial</span>.
          </p>

          {/* Billing Toggle */}
          <div className="mt-16 inline-flex justify-center items-center gap-6 p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl shadow-xl">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${billingCycle === 'monthly' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Yearly
              <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* ─────── Translators Role ─────────────────────── */}
        <section className="mb-32">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-14 w-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <Globe className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] font-outfit">For Translators</h2>
              <p className="text-[var(--text-secondary)] font-medium">Reach more clients and manage your freelance career.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(translatorPlans).map(([key, plan]) => (
              <div key={key} className={`relative flex flex-col p-10 rounded-[2.5rem] border bg-[var(--bg-secondary)] transition-all hover:scale-[1.02] hover:shadow-3xl ${key === 'standard' ? 'border-[var(--accent)] ring-4 ring-[var(--accent)]/5' : 'border-[var(--border)]'}`}>
                {key === 'standard' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    Best Value
                  </div>
                )}
                <div className="mb-8">{plan.icon}</div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 font-outfit">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-[var(--text-primary)]">
                    ${'price' in plan ? plan.price : (billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                  </span>
                  <span className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
                    / {billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium mb-8 leading-relaxed">{plan.description}</p>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm font-bold text-[var(--text-primary)]/80">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>

                {'link' in plan ? (
                  <Link href={plan.link} className="w-full py-4 rounded-2xl border-2 border-[var(--border)] text-center text-sm font-black text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                    Start for Free
                  </Link>
                ) : (
                  <PayPalButton 
                    planId={billingCycle === 'monthly' ? plan.planIds.monthly : plan.planIds.yearly} 
                    onSuccess={handlePayPalSuccess}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─────── Business Role ────────────────────────── */}
        <section className="mb-32">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Briefcase className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] font-outfit">For Businesses</h2>
              <p className="text-[var(--text-secondary)] font-medium">Easier recruitment and better vendor management results.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(businessPlans).map(([key, plan]) => (
              <div key={key} className={`relative flex flex-col p-10 rounded-[2.5rem] border bg-[var(--bg-secondary)] transition-all hover:scale-[1.02] hover:shadow-3xl ${key === 'standard' ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-[var(--border)]'}`}>
                {key === 'enterprise' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    Scale Choice
                  </div>
                )}
                <div className="mb-8">{plan.icon}</div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 font-outfit">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-[var(--text-primary)]">
                    ${'price' in plan ? plan.price : (billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                  </span>
                  <span className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
                    / {billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] font-medium mb-8 leading-relaxed">{plan.description}</p>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm font-bold text-[var(--text-primary)]/80">
                      <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>

                {'link' in plan ? (
                  <Link href={plan.link} className="w-full py-4 rounded-2xl border-2 border-[var(--border)] text-center text-sm font-black text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-500 transition-all">
                    Start Hiring
                  </Link>
                ) : (
                  <PayPalButton 
                    planId={billingCycle === 'monthly' ? plan.planIds.monthly : plan.planIds.yearly} 
                    onSuccess={handlePayPalSuccess}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─────── Comparison Table ────────────────────── */}
        <section className="mt-48">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[var(--text-primary)] font-outfit mb-4">Compare Features</h2>
            <p className="text-[var(--text-secondary)] font-medium">Everything you need to know about our service package options.</p>
          </div>

          {/* Translator Comparison */}
          <div className="mb-24 overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl">
            <div className="p-10 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex items-center justify-between">
              <h3 className="text-xl font-black text-[var(--text-primary)] font-outfit">Detailed Translator Matrix</h3>
              <div className="flex gap-6 uppercase tracking-widest text-[10px] font-black text-[var(--text-secondary)]">
                <span className="w-24 text-center">Basic</span>
                <span className="w-24 text-center text-[var(--accent)]">Standard</span>
                <span className="w-24 text-center text-indigo-500">Plus</span>
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {translatorFeatures.map((f, i) => (
                <div key={i} className="flex items-center px-10 py-6 hover:bg-[var(--bg-main)] transition-colors group">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]/80 group-hover:text-[var(--accent)] transition-colors">{f.name}</span>
                    <HelpCircle className="h-3.5 w-3.5 text-[var(--text-secondary)]/30" />
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="w-24 flex justify-center">{renderCellValue(f.free)}</div>
                    <div className="w-24 flex justify-center font-black text-[var(--accent)]">{renderCellValue(f.standard)}</div>
                    <div className="w-24 flex justify-center font-black text-indigo-500">{renderCellValue(f.plus)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Comparison */}
          <div className="overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl">
            <div className="p-10 border-b border-[var(--border)] bg-[var(--bg-main)]/50 flex items-center justify-between">
              <h3 className="text-xl font-black text-[var(--text-primary)] font-outfit">Detailed Business Matrix</h3>
              <div className="flex gap-6 uppercase tracking-widest text-[10px] font-black text-[var(--text-secondary)]">
                <span className="w-24 text-center">Basic</span>
                <span className="w-24 text-center text-indigo-500">Standard</span>
                <span className="w-24 text-center text-rose-500">Enterprise</span>
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {businessFeatures.map((f, i) => (
                <div key={i} className="flex items-center px-10 py-6 hover:bg-[var(--bg-main)] transition-colors group">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]/80 group-hover:text-indigo-500 transition-colors">{f.name}</span>
                    <HelpCircle className="h-3.5 w-3.5 text-[var(--text-secondary)]/30" />
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="w-24 flex justify-center">{renderCellValue(f.basic)}</div>
                    <div className="w-24 flex justify-center font-black text-indigo-500">{renderCellValue(f.standard)}</div>
                    <div className="w-24 flex justify-center font-black text-rose-500">{renderCellValue(f.enterprise)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section Placeholder */}
        <div className="mt-48 text-center pt-24 border-t border-[var(--border)]">
          <p className="text-lg text-[var(--text-secondary)] font-medium">
            Looking for a custom plan? <Link href="/contact" className="text-[var(--accent)] font-bold hover:underline decoration-2">Contact our sales team</Link>
          </p>
          <div className="mt-12 flex justify-center gap-8 text-[var(--text-secondary)]/40">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-30 grayscale" />
            <span className="text-xl font-black tracking-tighter">SECURE STRIPE</span>
            <span className="text-xl font-black tracking-tighter">BITCOIN READY</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function renderCellValue(val: any) {
  if (val === true) return <Check className="h-5 w-5 text-emerald-500" />;
  if (val === false) return <X className="h-5 w-5 text-red-400" />;
  return <span className="text-[11px] uppercase tracking-tighter">{val}</span>;
}

function Briefcase(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

