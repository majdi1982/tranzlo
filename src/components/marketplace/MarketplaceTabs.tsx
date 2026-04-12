'use client';

import * as React from 'react';

interface MarketplaceTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  accentColor?: string;
}

export default function MarketplaceTabs({ tabs, activeTab, onTabChange, accentColor = 'var(--accent)' }: MarketplaceTabsProps) {
  return (
    <div className="flex items-center justify-center border-b border-[var(--border)] mb-10 overflow-x-auto no-scrollbar">
      <div className="flex gap-8 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab 
                ? 'text-[var(--text-primary)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div 
                className="absolute bottom-0 left-0 w-full h-1 rounded-t-full transition-all"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
