'use client';

import * as React from 'react';
import MarketplaceTabs from '@/components/marketplace/MarketplaceTabs';
import CommunityCard from '@/components/marketplace/CommunityCard';
import JobFeedCard from '@/components/marketplace/JobFeedCard';
import { Sparkles, PenTool, Search, HelpCircle, Bell } from 'lucide-react';
import Link from 'next/link';

interface HubFeedProps {
  userRole: string;
}

export default function HubFeed({ userRole }: HubFeedProps) {
  const [activeTab, setActiveTab] = React.useState('Jobs');
  const tabs = ['Jobs', 'Community', 'Discussions', 'Statuses'];

  // Mock data for the feed
  const communityData = [
    {
      id: 'h1',
      user: { name: ' Marie Christine' },
      timeAgo: '2h ago',
      sourceLang: 'EN',
      targetLang: 'IT',
      category: 'Legal',
      term: 'Non-disclosure agreement addendum',
      replies: 2
    },
    {
      id: 'h2',
      user: { name: 'Spyros S.' },
      timeAgo: '4h ago',
      sourceLang: 'DE',
      targetLang: 'EL',
      category: 'Technical',
      term: 'Hydraulic steering gear',
      replies: 1
    }
  ];

  const jobData = [
    {
       id: 'hj1',
       title: 'Legal Contract Translation (EN -> FR)',
       sourceLang: 'EN',
       targetLangs: ['FR'],
       budget: '$2,500',
       type: 'Fixed Price',
       timeAgo: '2h ago'
    },
    {
       id: 'hj2',
       title: 'Technical Manual - App Localization',
       sourceLang: 'DE',
       targetLangs: ['ES', 'IT'],
       budget: '$0.12/word',
       type: 'Freelance',
       timeAgo: '5h ago'
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Announcement Widget */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-3 text-[var(--accent)] group-hover:rotate-12 transition-transform">
            <Sparkles className="h-20 w-20 opacity-5" />
         </div>
         <div className="relative z-10 flex items-center justify-between gap-6">
            <div>
               <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-1 flex items-center gap-2">
                 <Bell className="h-4 w-4 animate-bounce" />
                 Important Update
               </h3>
               <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                 The location in your profile does not match your last saved location. This might affect the ability of clients to find you.
               </p>
            </div>
            <button className="shrink-0 px-4 py-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all">
               Update
            </button>
         </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
         <Link href="/dashboard/translator/profile" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.05] transition-all text-center">
            <PenTool className="h-6 w-6 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Complete Profile</span>
         </Link>
         <Link href="/jobs" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.05] transition-all text-center">
            <Search className="h-6 w-6 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Find Jobs</span>
         </Link>
         <Link href="/pricing" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.05] transition-all text-center">
            <Sparkles className="h-6 w-6 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Become a Pro</span>
         </Link>
         <Link href="/pricing" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.05] transition-all text-center">
            <HelpCircle className="h-6 w-6 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Get Training</span>
         </Link>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-4 sm:p-8 min-h-[600px] shadow-sm">
        <MarketplaceTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <div className="space-y-6">
           {activeTab === 'Jobs' && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Personalized Job Feed</h4>
                  <Link href="/jobs" className="text-[10px] font-black text-[var(--accent)] hover:underline">View all</Link>
                </div>
                {jobData.map((job) => (
                  <JobFeedCard key={job.id} {...job} />
                ))}
              </div>
           )}

           {activeTab === 'Community' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                <div className="col-span-full flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Latest Community Questions</h4>
                  <Link href="/community" className="text-[10px] font-black text-[var(--accent)] hover:underline">More questions</Link>
                </div>
                {communityData.map((item) => (
                  <CommunityCard key={item.id} {...item} />
                ))}
              </div>
           )}

           {activeTab !== 'Jobs' && activeTab !== 'Community' && (
             <div className="py-24 text-center animate-in fade-in duration-500">
                <div className="h-16 w-16 rounded-full bg-[var(--bg-main)] flex items-center justify-center mx-auto mb-6">
                  <Bell className="h-8 w-8 text-[var(--text-secondary)]/20" />
                </div>
                <h4 className="text-lg font-black text-[var(--text-primary)] mb-2 uppercase tracking-widest">{activeTab} section</h4>
                <p className="text-sm text-[var(--text-secondary)] font-medium italic">Updates from the community will appear here shortly...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
