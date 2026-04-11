import * as React from 'react';
import { 
  Users, MessageCircle, Zap, Shield, 
  Trophy, Heart, Globe, ArrowRight,
  Sparkles, Coffee
} from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <div className="bg-[var(--bg-main)] min-h-screen">
      {/* Hero Section */}
      <div className="relative pt-32 pb-24 overflow-hidden border-b border-[var(--border)]">
        <div className="absolute top-0 left-1/2 -tranzlate-x-1/2 w-full h-full bg-[var(--accent)]/5 rounded-full blur-[120px] -mt-[400px] pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-5 py-2 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-8 border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <Users className="h-4 w-4" />
            2,500+ Active Professionals
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] font-outfit mb-8 tracking-tighter leading-[1] max-w-4xl mx-auto">
             Where the world&apos;s best <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">translators</span> connect.
          </h1>
          <p className="max-w-xl mx-auto text-xl text-[var(--text-secondary)] font-medium mb-12">
            Join the most ambitious professional network for language experts. Collaborate, grow, and build your global career with Tranzlo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-10 py-5 bg-[var(--accent)] text-white font-black text-sm rounded-2xl shadow-2xl shadow-[var(--accent)]/20 hover:scale-105 transition-all"
            >
              Join the Community
            </Link>
            <Link 
              href="/blog" 
              className="px-10 py-5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] font-black text-sm rounded-2xl hover:bg-[var(--bg-main)] transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Community Pillars */}
      <div className="py-24 bg-[var(--bg-secondary)]/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all hover:border-[var(--accent)] group">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4">Masterminds</h3>
              <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                Connect with peers specializing in your niche. Share insights on complex terminology, local nuances, and industry standards.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all hover:border-[var(--accent)] group">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4">Fast-Track Career</h3>
              <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                Unlock exclusive job opportunities and partnership invites from high-growth companies looking for verified expertise.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all hover:border-[var(--accent)] group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4">Verified Trust</h3>
              <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                Build a reputation that lasts. Our community handles verification and peer reviews to ensure high-quality standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Stats */}
      <div className="py-24 container mx-auto px-4 max-w-5xl">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[50px] p-12 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 text-[var(--accent)]/10">
            <Globe className="h-64 w-64 rotate-12" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter leading-tight">
                Not just another <span className="text-[var(--accent)]">job platform</span>. A career home.
              </h2>
              <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed">
                Tranzlo Community provides the infrastructure for professional networking, mentoring, and skill validation.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Weekly networking masterminds',
                  'Verified skill badges & certification',
                  'Exclusive translator-only resources',
                  'Early access to premium job postings'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-[var(--text-primary)]">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[var(--bg-main)] rounded-3xl border border-[var(--border)] p-8 shadow-inner">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--text-secondary)]">Member Sentiment</p>
                    <p className="text-xl font-black text-[var(--text-primary)]">98% Satisfaction</p>
                  </div>
               </div>
               <div className="space-y-2">
                 <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                   <div className="h-full w-[98%] bg-gradient-to-r from-blue-600 to-indigo-500" />
                 </div>
                 <p className="text-[10px] text-right font-black text-[var(--text-secondary)] uppercase tracking-widest">Growth score</p>
               </div>
               
               <div className="mt-12 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-[var(--bg-main)] bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] italic">
                    Joined by <span className="text-[var(--text-primary)] font-black">2.5k+</span> peers
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="py-24 bg-gradient-to-b from-transparent to-[var(--bg-secondary)] border-t border-[var(--border)]">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl font-black text-[var(--text-primary)] mb-6">Ready to find your tribe?</h2>
          <p className="text-[var(--text-secondary)] font-medium mb-12 max-w-md mx-auto">
             Join thousands of professional translators today and start building the career you deserve.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-3 px-12 py-6 bg-[var(--accent)] text-white font-black text-sm rounded-2xl shadow-2xl shadow-[var(--accent)]/30 hover:scale-[1.05] transition-all"
          >
            Create Your Account
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="mt-12 flex items-center justify-center gap-8 text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Shield className="h-4 w-4" />
              Verified Expert Hub
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <Coffee className="h-4 w-4" />
              Supportive Network
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
