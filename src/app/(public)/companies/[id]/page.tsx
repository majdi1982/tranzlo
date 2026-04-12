import * as React from 'react';
import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { Query } from 'node-appwrite';
import { notFound } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Briefcase,
  Star as StarIcon,
  Search,
  MessageSquare,
  Users,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanyPublicProfilePage({ params }: Props) {
  const { id } = await params;

  try {
    const { databases } = await createAdminClient();
    const DB_ID = '69da165d00335f7a350e';
    
    // Fetch company document
    const company = await databases.getDocument(DB_ID, 'companies', id);
    
    // Fetch company's active jobs
    const jobsResponse = await databases.listDocuments(DB_ID, 'jobs', [
      Query.equal('userId', id),
      Query.equal('status', 'published'),
      Query.limit(5)
    ]);
    const activeJobs = jobsResponse.documents;

    let currentUserId = '';
    try {
      const { account } = await createSessionClient();
      const user = await account.get();
      currentUserId = user.$id;
    } catch (e) { /* Not logged in */ }

    return (
      <div className="bg-[var(--bg-main)] min-h-screen pb-20 font-outfit">
        {/* Immersive Hero Header */}
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 overflow-hidden">
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
           
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl h-full flex flex-col justify-end pb-12 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 mb-4">
                       <ShieldCheck className="h-3 w-3" />
                       Verified Business Partner
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none">{company.companyName || 'Verified Company'}</h1>
                    <div className="flex items-center gap-6 mt-4">
                       <div className="flex items-center gap-2 text-blue-100/80 text-sm font-bold">
                          <MapPin className="h-4 w-4" />
                          Global Operations
                       </div>
                       <div className="flex items-center gap-2 text-blue-100/80 text-sm font-bold">
                          <Users className="h-4 w-4" />
                          10-50 Employees
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl">
                    <div className="text-center px-4 border-r border-white/10">
                       <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Success Rate</p>
                       <p className="text-2xl font-black text-white">98%</p>
                    </div>
                    <div className="text-center px-4">
                       <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Active Jobs</p>
                       <p className="text-2xl font-black text-white">{activeJobs.length}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-xl text-center backdrop-blur-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <Building2 className="h-20 w-20" />
                 </div>
                 
                 <div className="relative mb-8 pt-4">
                    <div className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-2xl p-6">
                       <Building2 className="h-full w-full" />
                    </div>
                 </div>

                 <div className="space-y-3">
                   <Link 
                     href={currentUserId ? `/dashboard/chat?userId=${id}` : '/login'}
                     className="flex items-center justify-center gap-3 w-full rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white hover:bg-indigo-700 hover:scale-[1.05] active:scale-[0.98] shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest"
                   >
                     <MessageSquare className="h-4.5 w-4.5" />
                     Contact Team
                   </Link>
                   <button className="flex items-center justify-center gap-3 w-full rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] py-4 text-sm font-black text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-600 transition-all uppercase tracking-widest">
                     Follow Brand
                   </button>
                 </div>

                 <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-4">
                   <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                      <span>Verification</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                   </div>
                   <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                      <span>Response Time</span>
                      <span className="text-[var(--text-primary)]">~4 Hours</span>
                   </div>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -bottom-4 -right-4 opacity-20">
                    <Award className="h-24 w-24" />
                 </div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-300 mb-4">Pro Recruiter</h4>
                 <p className="text-sm font-medium leading-relaxed opacity-80 mb-6">This company has a history of successful long-term contracts.</p>
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                 </div>
              </div>
            </div>

            {/* Main Corporate Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* About Brief */}
              <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border)] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                   <Building2 className="h-48 w-48" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-4 uppercase tracking-tighter">
                  <div className="h-10 w-1 bg-indigo-600 rounded-full" />
                  Corporate Mission
                </h2>
                <div className="text-[var(--text-secondary)] text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {company.description || "This organization is a verified Tranzlo Enterprise partner. They are committed to bridging language gaps with high-quality localization and translation projects. As a professional recruiter on our platform, they prioritize accuracy, timely communication, and fair compensation for all specialized translators."}
                </div>
              </div>

              {/* Recruitment Opportunities */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[3rem] p-10 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                   <div>
                      <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-4 uppercase tracking-tighter">
                        <div className="h-10 w-1 bg-blue-500 rounded-full" />
                        Active Recruitments
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] font-bold mt-1 uppercase tracking-widest opacity-60">High-priority language pairs</p>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest shrink-0">
                     <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping mr-1" />
                     {activeJobs.length} Positions Open
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeJobs.length > 0 ? (
                    activeJobs.map((job) => (
                      <Link 
                        key={job.$id} 
                        href={`/jobs/${job.$id}`}
                        className="group flex flex-col p-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-main)]/30 hover:bg-white dark:hover:bg-indigo-900/10 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
                      >
                         <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                               {job.serviceType || 'Translation'}
                            </span>
                            <span className="text-xs font-black text-indigo-600">$1,500</span>
                         </div>
                         <h3 className="font-black text-[var(--text-primary)] text-lg mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">{job.jobTitle}</h3>
                         <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border)]/50">
                            <div className="flex items-center gap-2">
                               <Globe className="h-3.5 w-3.5 text-indigo-500" />
                               <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{job.sourceLanguage} → {job.targetLanguages?.[0]}</span>
                            </div>
                            <div className="h-8 w-8 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-indigo-600 group-hover:text-white transition-all">
                               <Search className="h-4 w-4" />
                            </div>
                         </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-20 bg-[var(--bg-main)]/50 rounded-[2rem] border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-center px-6">
                       <Search className="h-10 w-10 text-[var(--text-secondary)] opacity-10 mb-4" />
                       <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">No active recruitments found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Company profile error', err);
    notFound();
  }
}
