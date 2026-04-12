'use client';

import * as React from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Trash2, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('Profile');
  const tabs = [
    { id: 'Profile', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Security', icon: Shield },
    { id: 'Account', icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-10 mb-20 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[var(--text-primary)] font-outfit mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)] font-medium">Manage your account preferences and global security settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Settings Navigation */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.id}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1">
           <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2rem] p-6 sm:p-10 shadow-sm min-h-[500px]">
              
              {activeTab === 'Profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 pb-8 border-b border-[var(--border)]">
                    <div className="h-20 w-20 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] overflow-hidden">
                       <User className="h-10 w-10 opacity-20" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">Your Profile Picture</h3>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mb-4">PNG or JPG, max 5MB</p>
                      <button className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:bg-[var(--hover)] transition-all">
                        Update Avatar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] ml-1">Full Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-sm font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] outline-none" defaultValue="Magdy" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] ml-1">Email Address</label>
                      <input type="email" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-sm font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] outline-none" defaultValue="magdy@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] ml-1">Bio / Headline</label>
                    <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-sm font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] outline-none resize-none" defaultValue="Professional translator with 10+ years of experience." />
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button className="px-8 py-3 rounded-xl bg-[var(--text-primary)] text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 flex items-start gap-4">
                     <ShieldCheck className="h-6 w-6 text-blue-600 mt-1" />
                     <div>
                        <h4 className="text-sm font-black text-blue-900 dark:text-blue-100 mb-1 uppercase tracking-tight">Two-Factor Authentication</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Add an extra layer of security to your account by enabling 2FA via SMS or Authenticator App.</p>
                        <button className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">Enable 2FA</button>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">Update Password</h3>
                    <div className="space-y-4">
                       <input type="password" placeholder="Current Password" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-sm font-bold outline-none" />
                       <input type="password" placeholder="New Password" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-sm font-bold outline-none" />
                    </div>
                    <button className="px-6 py-2 rounded-xl border-2 border-[var(--border)] text-xs font-black text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                      Change Password
                    </button>
                  </div>

                  <div className="pt-8 border-t border-[var(--border)]">
                     <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-main)] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <Smartphone className="h-5 w-5 text-[var(--text-secondary)]" />
                           <div>
                              <p className="text-xs font-bold text-[var(--text-primary)]">Last Login from iPhone 15</p>
                              <p className="text-[10px] text-[var(--text-secondary)]">London, UK • 2 hours ago</p>
                           </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-all" />
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="space-y-6">
                   <h3 className="text-sm font-black text-[var(--text-primary)] mb-6">Notification Preferences</h3>
                   
                   {[
                     { title: 'Job Matches', desc: 'Get alerts when a new job matches your skills.' },
                     { title: 'Messages', desc: 'Notify me when I receive a new secure message.' },
                     { title: 'Community Updates', desc: 'New questions in your favorite categories.' },
                     { title: 'Marketing', desc: 'News about Tranzlo features and training.' }
                   ].map((item) => (
                     <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)]/30">
                        <div>
                           <p className="text-sm font-bold text-[var(--text-primary)]">{item.title}</p>
                           <p className="text-[10px] text-[var(--text-secondary)] font-medium">{item.desc}</p>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-emerald-500 p-1 flex items-center justify-end">
                           <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'Account' && (
                <div className="space-y-10">
                   <div>
                      <h3 className="text-sm font-black text-[var(--text-primary)] mb-4">Subscription Plan</h3>
                      <div className="p-6 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)]/5 flex items-center justify-between">
                         <div>
                            <p className="text-xs font-black text-[var(--accent)] uppercase tracking-widest mb-1">Standard Pro</p>
                            <p className="text-xl font-black text-[var(--text-primary)]">$12 / Month</p>
                         </div>
                         <button className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest">Upgrade</button>
                      </div>
                   </div>

                   <div className="pt-10 border-t border-[var(--border)]">
                      <h3 className="text-sm font-black text-rose-500 mb-2">Danger Zone</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                      <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 text-xs font-bold hover:bg-rose-100 transition-all">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
