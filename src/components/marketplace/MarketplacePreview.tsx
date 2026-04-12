'use client';

import * as React from 'react';
import MarketplaceTabs from './MarketplaceTabs';
import CommunityCard from './CommunityCard';
import JobFeedCard from './JobFeedCard';
import { ArrowRight, Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePreview() {
  const [activeTab, setActiveTab] = React.useState('Terms');
  const tabs = ['Jobs', 'Terms', 'Discussions', 'Events & training', 'Translation news'];

  const communityData = [
    {
      id: '1',
      user: { name: 'Marie Christine Cramay' },
      timeAgo: '13 hours ago',
      sourceLang: 'French',
      targetLang: 'Italian',
      category: 'Poetry & Literature',
      term: 'suceur de sueur',
      replies: 0
    },
    {
      id: '2',
      user: { name: 'Spyros Salimpas' },
      timeAgo: '18 hours ago',
      sourceLang: 'English',
      targetLang: 'Greek',
      category: 'Medical (general)',
      term: 'take effect',
      replies: 1
    },
    {
      id: '3',
      user: { name: 'Pierfrancesco Proietti' },
      timeAgo: '20 hours ago',
      sourceLang: 'English',
      targetLang: 'Italian',
      category: 'Law (general)',
      term: 'when accounting',
      replies: 3
    }
  ];

  const jobData = [
    {
       id: 'j1',
       title: 'Legal Contract Translation (EN -> FR)',
       sourceLang: 'English',
       targetLangs: ['French'],
       budget: '$2,500',
       type: 'Fixed Price',
       timeAgo: '2 hours ago'
    },
    {
       id: 'j2',
       title: 'Technical Manual - App Localization',
       sourceLang: 'German',
       targetLangs: ['Spanish', 'Italian'],
       budget: '$0.12/word',
       type: 'Freelance',
       timeAgo: '5 hours ago'
    },
    {
       id: 'j3',
       title: 'Creative Marketing Campaign',
       sourceLang: 'English',
       targetLangs: ['Japanese'],
       budget: '$1,200',
       type: 'Fixed Price',
       timeAgo: '8 hours ago'
    }
  ];

  return (
    <section className="w-full py-24 bg-[var(--bg-main)]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[var(--text-primary)] font-outfit mb-4">A quick look at Tranzlo</h2>
          <p className="text-[var(--text-secondary)] font-medium">Explore the latest activity in the community</p>
        </div>

        <MarketplaceTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          accentColor="var(--accent)"
        />

        <div className="mb-12">
           {activeTab === 'Terms' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {communityData.map((item) => (
                  <CommunityCard key={item.id} {...item} />
                ))}
             </div>
           )}
           
           {activeTab === 'Jobs' && (
             <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto animate-in fade-in duration-500">
                {jobData.map((item) => (
                  <JobFeedCard key={item.id} {...item} />
                ))}
             </div>
           )}

           {activeTab !== 'Terms' && activeTab !== 'Jobs' && (
             <div className="py-20 text-center bg-[var(--bg-secondary)] border border-dashed border-[var(--border)] rounded-3xl animate-in fade-in duration-500">
               <p className="text-[var(--text-secondary)] font-medium italic">Latest {activeTab.toLowerCase()} updates coming soon...</p>
             </div>
           )}
        </div>

        {/* Action Bar */}
        <div className="p-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="px-6 py-2">
            <span className="text-xs font-black text-[var(--accent)] uppercase tracking-wider">3,914,876 translation questions asked</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 pr-1.5">
            <Link href="/community" className="px-6 py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              More questions
            </Link>
            <Link href="/search" className="px-6 py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Search for terms
            </Link>
            <Link 
              href="/dashboard/community/new" 
              className="px-8 py-3 rounded-full bg-[var(--accent)] text-xs font-black text-white shadow-lg shadow-[var(--accent)]/10 hover:bg-[var(--hover)] hover:scale-[1.05] transition-all flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Ask question
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
