import Link from 'next/link';
import { ArrowRight, Globe, ShieldCheck, MessageSquare, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-[var(--bg-main)] py-24 sm:py-32 flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-[var(--bg-main)] to-[var(--bg-main)]"></div>
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-6xl md:text-7xl mb-6">
            The global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">translation</span> marketplace
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)] sm:text-xl mb-10">
            Connect directly with verified professional translators or find high-quality jobs from companies around the world. Secure, fast, and completely automated.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup?role=company" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-[var(--hover)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Hire Translators
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/signup?role=translator" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] px-8 py-4 text-base font-semibold text-[var(--text-primary)] shadow-sm hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Join as Translator
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="w-full bg-[var(--bg-secondary)] py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Why choose Tranzlo?
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">Platform built for trust and efficiency</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--bg-main)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--border)]">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-[var(--accent)]">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Global Reach</h3>
              <p className="text-[var(--text-secondary)]">Translate to and from any language with our diverse network.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--bg-main)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--border)]">
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 text-indigo-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Verified Talent</h3>
              <p className="text-[var(--text-secondary)]">Every translator and company is vetted for your peace of mind.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--bg-main)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--border)]">
              <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-4 text-teal-500">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Realtime Chat</h3>
              <p className="text-[var(--text-secondary)]">Communicate directly securely without leaving the platform.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--bg-main)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--border)]">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-4 text-orange-500">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Automation</h3>
              <p className="text-[var(--text-secondary)]">From payments to notifications, we automate the heavy lifting.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full py-24 bg-[var(--bg-main)]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-10 sm:p-16 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                Ready to transform your translation workflow?
              </h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                Join thousands using Tranzlo today and experience frictionless project delivery.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-blue-600 shadow-sm hover:scale-105 transition-transform duration-300"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
