import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { databases, APPWRITE_CONFIG, ID, Query } from '../../lib/appwrite';
import { generateTrzId } from '../../lib/utils/ids';
import { JobService } from '../../lib/services/jobService';
import { LANGUAGES } from '../../constants/languages';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Globe, 
  User, 
  FileText,
  HelpCircle
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<{ [jobId: string]: any[] }>({});
  const [translatorBids, setTranslatorBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // holds applicationId being accepted
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  const isTranslator = user?.role === 'translator';

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isTranslator) {
        // Fetch proposals submitted by this translator
        const bidsRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.jobApplications,
          [
            Query.equal('userId', user.$id),
            Query.orderDesc('createdAt')
          ]
        );
        
        // Fetch corresponding job info for each bid
        const enrichedBids = await Promise.all(
          bidsRes.documents.map(async (bid: any) => {
            try {
              const jobRes = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.jobs,
                bid.jobId
              );
              return { ...bid, job: jobRes };
            } catch (err) {
              return { ...bid, job: { title: 'Unknown Project (Removed)', fromLanguage: '', toLanguage: '', budget: 0 } };
            }
          })
        );
        setTranslatorBids(enrichedBids);
      } else {
        // Fetch jobs posted by this company
        const jobsRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.jobs,
          [
            Query.equal('createdBy', user.$id),
            Query.orderDesc('createdAt')
          ]
        );
        setJobs(jobsRes.documents);

        // Fetch applications (bids) for each of these jobs
        const appsMap: { [jobId: string]: any[] } = {};
        await Promise.all(
          jobsRes.documents.map(async (job: any) => {
            const appsRes = await databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.jobApplications,
              [
                Query.equal('jobId', job.$id)
              ]
            );
            
            // Enrich applications with translator profiles
            const enrichedApps = await Promise.all(
              appsRes.documents.map(async (app: any) => {
                try {
                  const translatorRes = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translators,
                    app.userId
                  );
                  return { ...app, translator: translatorRes };
                } catch (err) {
                  return { ...app, translator: { name: 'Expert Translator', email: '' } };
                }
              })
            );
            appsMap[job.$id] = enrichedApps;
          })
        );
        setApplications(appsMap);
      }
    } catch (e) {
      console.error('Failed to fetch project data:', e);
      showToast('Error', 'Unable to load project workflows.', 'dispute');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAcceptProposal = async (jobId: string, acceptedAppId: string, translatorId: string, translatorName: string, _budget: number) => {
    setActionLoading(acceptedAppId);
    const now = new Date().toISOString();
    try {
      // 1. Set the accepted proposal's status to 'accepted'
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.jobApplications,
        acceptedAppId,
        {
          status: 'accepted',
          updatedAt: now
        }
      );

      // 2. Set the job status to 'in_progress'
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.jobs,
        jobId,
        {
          status: 'in_progress',
          updatedAt: now
        }
      );

      // 3. Reject/decline all other applications for this job
      const otherApps = (applications[jobId] || []).filter(app => app.$id !== acceptedAppId);
      await Promise.all(
        otherApps.map(async (app) => {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.jobApplications,
            app.$id,
            {
              status: 'declined',
              updatedAt: now
            }
          );

          // Notify declined translators
          try {
            await databases.createDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.notifications,
              ID.unique(),
              {
                publicId: generateTrzId('APP'),
                entityType: 'notification',
                createdAt: now,
                updatedAt: now,
                createdBy: 'system',
                status: 'active',
                visibility: 'private',
                title: 'Proposal Declined',
                message: `Thank you for your proposal. The company has filled the position for this project.`,
                type: 'system',
                userId: app.userId
              }
            );
          } catch (err) {
            console.error('Failed to send decline notification:', err);
          }
        })
      );

      // 4. Create Notification for the accepted translator
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications,
        ID.unique(),
        {
          publicId: generateTrzId('APP'),
          entityType: 'notification',
          createdAt: now,
          updatedAt: now,
          createdBy: 'system',
          status: 'active',
          visibility: 'private',
          title: 'Proposal Accepted! 🎉',
          message: `Congratulations! Your bid for project "${jobs.find(j => j.$id === jobId)?.title}" was approved. Get started now!`,
          type: 'success',
          userId: translatorId
        }
      );

      // 5. System audit log
      await JobService.logAction(
        'ACCEPT_BID',
        user?.$id || 'unknown',
        jobId,
        `Approved translator ${translatorName} (${translatorId}) proposal ${acceptedAppId}`
      );

      showToast('Proposal Accepted!', `You hired ${translatorName} for this project.`, 'success');
      
      // Refresh local state
      await fetchData();
    } catch (err) {
      console.error('Failed to accept proposal:', err);
      showToast('Error', 'Failed to approve bid. Please try again.', 'dispute');
    } finally {
      setActionLoading(null);
    }
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.name || code;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
            {isTranslator ? 'My Proposals & Workflows' : 'Posted Projects & Proposals'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isTranslator 
              ? 'Track the status of all bids and active translation jobs you submitted.' 
              : 'Review submitted translator proposals, choose the ideal expert, and lock in escrow contract agreements.'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold">Retrieving marketplace contracts...</p>
          </div>
        ) : isTranslator ? (
          // ================= TRANSLATOR WORKSPACE VIEW =================
          translatorBids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-3xl text-center px-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-slate-400 dark:text-slate-600">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">No Proposals Submitted</h4>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 text-sm leading-relaxed">
                You haven't bid on any translation projects yet. Head back to the workspace feed and apply to active projects!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {translatorBids.map((bid) => {
                const statusStyles = {
                  pending: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Pending Review', icon: <Clock className="w-4 h-4" /> },
                  accepted: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: 'Hired & Active', icon: <CheckCircle2 className="w-4 h-4" /> },
                  declined: { bg: 'bg-slate-500/10 text-slate-500', label: 'Declined', icon: <XCircle className="w-4 h-4" /> }
                }[bid.status as 'pending' | 'accepted' | 'declined'] || { bg: 'bg-blue-500/10 text-blue-600', label: bid.status, icon: <HelpCircle className="w-4 h-4" /> };

                return (
                  <div key={bid.$id} className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-white/10 transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${statusStyles.bg}`}>
                          {statusStyles.icon}
                          {statusStyles.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                          <Globe className="w-3 h-3" />
                          {getLanguageName(bid.job.fromLanguage)} ➔ {getLanguageName(bid.job.toLanguage)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate">
                        {bid.job.title}
                      </h3>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">My Proposal Cover Letter</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                          "{bid.proposal}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center md:flex-col md:items-end justify-between w-full md:w-auto shrink-0 gap-6 border-t md:border-0 border-slate-100 dark:border-white/5 pt-4 md:pt-0">
                      <div className="md:text-right">
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-semibold mb-0.5">Proposed Price</p>
                        <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">${bid.bidAmount}</h4>
                      </div>
                      <div className="md:text-right">
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-semibold mb-0.5">Delivery Time</p>
                        <span className="text-sm font-bold text-slate-700 dark:text-white">{bid.deliveryDays} Days</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // ================= COMPANY PROJECTS MANAGER VIEW =================
          jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-3xl text-center px-4 shadow-sm animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-slate-400 dark:text-slate-600">
                <Briefcase className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">No Posted Projects Found</h4>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 text-sm leading-relaxed">
                You haven't posted any translation projects yet. Create your first contract by clicking the "Post New Project" button on the sidebar.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Premium Tab Navigation */}
              <div className="flex border-b border-slate-200 dark:border-white/5 pb-0 mb-6 gap-4 overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: 'All Projects / كل المشاريع', count: jobs.length },
                  { id: 'in_progress', label: 'In Progress / تحت العمل', count: jobs.filter(j => j.status === 'in_progress').length },
                  { id: 'completed', label: 'Completed / المكتملة', count: jobs.filter(j => j.status === 'completed').length },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setExpandedJobId(null); // collapse active expansion on tab change
                      }}
                      className={`pb-4 px-2 font-bold text-sm relative transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive 
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' 
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                      }`}>
                        {tab.count}
                      </span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full shadow-lg shadow-blue-500/50" />
                      )}
                    </button>
                  );
                })}
              </div>

              {jobs.filter(job => {
                if (activeTab === 'all') return true;
                if (activeTab === 'in_progress') return job.status === 'in_progress';
                if (activeTab === 'completed') return job.status === 'completed';
                return true;
              }).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-white/5 rounded-3xl text-center px-4 shadow-sm">
                  <p className="text-slate-500 dark:text-slate-450 text-sm font-semibold">
                    No projects found matching this status filter.
                  </p>
                </div>
              ) : (
                jobs.filter(job => {
                  if (activeTab === 'all') return true;
                  if (activeTab === 'in_progress') return job.status === 'in_progress';
                  if (activeTab === 'completed') return job.status === 'completed';
                  return true;
                }).map((job) => {
                  const jobApps = applications[job.$id] || [];
                  const isExpanded = expandedJobId === job.$id;
                  const acceptedApp = jobApps.find(app => app.status === 'accepted');

                const statusStyles = {
                  active: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', label: 'Bidding Open' },
                  in_progress: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: 'Active Contract' },
                  completed: { bg: 'bg-slate-500/10 text-slate-500', label: 'Closed' }
                }[job.status as 'active' | 'in_progress' | 'completed'] || { bg: 'bg-slate-500/10 text-slate-500', label: job.status };

                return (
                  <div 
                    key={job.$id} 
                    className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Main Job Row */}
                    <div 
                      onClick={() => setExpandedJobId(isExpanded ? null : job.$id)}
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/2 transition-colors relative"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold ${statusStyles.bg}`}>
                            {statusStyles.label}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                            <Globe className="w-3 h-3" />
                            {getLanguageName(job.fromLanguage)} ➔ {getLanguageName(job.toLanguage)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-2 max-w-3xl leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex items-center shrink-0 gap-6 justify-between border-t md:border-0 border-slate-100 dark:border-white/5 pt-4 md:pt-0">
                        <div className="md:text-right">
                          <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-semibold mb-0.5">Budget</p>
                          <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">${job.budget}</h4>
                        </div>
                        <div className="md:text-right">
                          <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-semibold mb-0.5">Bids Received</p>
                          <span className="text-sm font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                            {jobApps.length}
                          </span>
                        </div>
                        <div className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Application Bids Section */}
                    {isExpanded && (
                      <div className="bg-slate-50 dark:bg-slate-950/30 border-t border-slate-150 dark:border-white/5 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            {job.status === 'in_progress' ? 'Contract Details' : 'Translator Proposals'}
                          </h4>
                          {job.status === 'active' && jobApps.length > 0 && (
                            <span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                              Choose 1 Proposal to begin the contract
                            </span>
                          )}
                        </div>

                        {jobApps.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-sm">
                            No translators have bid on this job yet. Check back soon!
                          </div>
                        ) : job.status === 'in_progress' && acceptedApp ? (
                          // Contract in progress view (Approved translator card highlighted)
                          <div className="p-6 bg-emerald-500/5 dark:bg-emerald-500/2 border-2 border-emerald-500/20 rounded-3xl relative">
                            <div className="flex flex-col sm:flex-row justify-between gap-6 sm:items-center">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                      {acceptedApp.translator.name}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{acceptedApp.translator.email}</p>
                                  </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-emerald-500/10">
                                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Contract Cover Letter</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed italic">
                                    "{acceptedApp.proposal}"
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 flex sm:flex-col sm:items-end justify-between sm:justify-start gap-4">
                                <div>
                                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Agreed Budget</p>
                                  <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">${acceptedApp.bidAmount}</h4>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Target Delivery</p>
                                  <span className="text-xs font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                                    {acceptedApp.deliveryDays} Days
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // List of pending proposals for bidding open stage
                          <div className="grid grid-cols-1 gap-4">
                            {jobApps.map((app) => (
                              <div 
                                key={app.$id}
                                className={`p-5 bg-white dark:bg-slate-900/50 border rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                                  app.status === 'declined' 
                                    ? 'opacity-40 border-slate-150 dark:border-white/2 filter grayscale' 
                                    : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-sm'
                                }`}
                              >
                                <div className="space-y-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-slate-800 dark:text-white text-sm">{app.translator.name}</h5>
                                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Linguistic Expert</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                    "{app.proposal}"
                                  </p>
                                </div>

                                <div className="shrink-0 flex flex-row md:flex-col md:items-end justify-between md:justify-center gap-4 border-t md:border-0 border-slate-100 dark:border-white/5 pt-4 md:pt-0">
                                  <div className="md:text-right">
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Bid Amount</p>
                                    <h5 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">${app.bidAmount}</h5>
                                  </div>
                                  <div className="md:text-right">
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Delivery Time</p>
                                    <span className="text-xs font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                                      {app.deliveryDays} Days
                                    </span>
                                  </div>
                                </div>

                                {job.status === 'active' && app.status !== 'declined' && (
                                  <div className="shrink-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100 dark:border-white/5 flex justify-end">
                                    <button
                                      disabled={actionLoading !== null}
                                      onClick={() => handleAcceptProposal(job.$id, app.$id, app.userId, app.translator.name, job.budget)}
                                      className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10 active:scale-95 transition-all cursor-pointer"
                                    >
                                      {actionLoading === app.$id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          Approve Bid
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
