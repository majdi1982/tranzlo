import Link from 'next/link';
import { ArrowRight, Globe, ShieldCheck, MessageSquare, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-[var(--bg-main)] py-24 sm:py-32 lg:pb-40 flex flex-col items-center text-center">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-[var(--text-secondary)] mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Join 2,500+ professionals globally
          </div>
          
          <h1 className="text-5xl font-black tracking-tight text-[var(--text-primary)] sm:text-7xl md:text-8xl mb-8 leading-[1.1]">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">translation</span> <br className="hidden sm:block" /> marketplace
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)] sm:text-xl md:text-2xl mb-12 font-medium leading-relaxed">
            Direct connections. Verified talent. <span className="text-[var(--text-primary)] font-bold italic">Zero friction.</span> <br />
            Experience the next generation of professional translation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/signup?role=company" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-[var(--accent)] px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/20 hover:bg-[var(--hover)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
            >
              Start Hiring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/signup?role=translator" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border)] px-10 py-5 text-lg font-bold text-[var(--text-primary)] shadow-sm hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
            >
              Get Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Stats Section */}
      <section className="w-full bg-[var(--bg-main)] py-12 border-y border-[var(--border)] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[var(--accent)] mb-1 font-outfit">$1.4M+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Paid to Translators</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-1 font-outfit">85k+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Projects Completed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-1 font-outfit">180+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Language Pairs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-1 font-outfit">99.2%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Quality Score</span>
            </div>
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
