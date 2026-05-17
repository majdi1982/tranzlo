import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  DollarSign, 
  Award,
  Globe,
  Clock,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { JobService } from '../../../lib/services/jobService';
import { databases, APPWRITE_CONFIG, ID } from '../../../lib/appwrite';
import { generateTrzId } from '../../../lib/utils/ids';
import { LANGUAGES } from '../../../constants/languages';

const TranslatorOverview = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [fromLang, setFromLang] = useState('all');
  const [toLang, setToLang] = useState('all');
  const [paymentType, setPaymentType] = useState('all');

  // Selected Job for detail/apply modal
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Application/Bid Form State
  const [bidForm, setBidForm] = useState({
    proposal: '',
    bidAmount: '',
    deliveryDays: ''
  });

  const stats = [
    { label: 'Proposals Submitted', value: '7', icon: <FileText className="w-5 h-5" />, color: 'blue' },
    { label: 'Active Jobs', value: '2', icon: <Briefcase className="w-5 h-5" />, color: 'purple' },
    { label: 'Total Earnings', value: '$840.00', icon: <DollarSign className="w-5 h-5" />, color: 'emerald' },
    { label: 'Reputation Score', value: '98%', icon: <Award className="w-5 h-5" />, color: 'amber' },
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await JobService.getPublicJobs();
      setJobs(response.documents);
    } catch (e) {
      console.error('Failed to fetch jobs:', e);
      showToast('Error', 'Failed to retrieve job feeds.', 'dispute');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJob) return;

    setSubmittingBid(true);
    const publicId = generateTrzId('APP');
    const now = new Date().toISOString();

    const applicationDoc = {
      publicId,
      entityType: 'jobApplication',
      createdAt: now,
      updatedAt: now,
      createdBy: user.$id,
      status: 'pending',
      visibility: 'private',
      proposal: bidForm.proposal,
      bidAmount: parseInt(bidForm.bidAmount),
      deliveryDays: parseInt(bidForm.deliveryDays),
      jobId: selectedJob.$id,
      userId: user.$id,
      organizationId: selectedJob.organizationId || selectedJob.createdBy || null,
    };

    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.jobApplications,
        ID.unique(),
        applicationDoc
      );

      await JobService.logAction(
        'SUBMIT_PROPOSAL',
        user.$id,
        selectedJob.$id,
        `Submitted proposal ${publicId} with amount $${bidForm.bidAmount}`
      );

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
            title: 'New Bid Received!',
            message: `A translator has applied to your project "${selectedJob.title}" proposing $${bidForm.bidAmount}.`,
            type: 'message',
            userId: selectedJob.createdBy,
          }
        );
      } catch (err) {
        console.error('Realtime notification delivery failed:', err);
      }

      setBidSuccess(true);
      showToast('Bid Submitted!', 'Your proposal has been successfully registered.', 'success');
      
      setTimeout(() => {
        setBidSuccess(false);
        setApplyModalOpen(false);
        setSelectedJob(null);
        setBidForm({ proposal: '', bidAmount: '', deliveryDays: '' });
      }, 2000);

    } catch (err) {
      console.error('Bid submission failed:', err);
      showToast('Failed', 'Unable to submit your proposal. Please try again.', 'dispute');
    } finally {
      setSubmittingBid(false);
    }
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.name || code;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrom = fromLang === 'all' ? true : job.fromLanguage === fromLang;
    const matchesTo = toLang === 'all' ? true : job.toLanguage === toLang;
    const matchesPay = paymentType === 'all' ? true : job.paymentType === paymentType;
    return matchesSearch && matchesFrom && matchesTo && matchesPay;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Translator Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}! Browse open jobs and apply with your proposals.</p>
        </div>
        <button 
          onClick={fetchJobs} 
          className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
        >
          Refresh Feed
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 dark:text-${stat.color}-400`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                Active
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Job Board Feed Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Job Filter Control */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 h-fit space-y-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Filter Feed</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Keywords..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-950 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Source Language</label>
              <select
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-all"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Languages</option>
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{lang.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Target Language</label>
              <select
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-all"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Languages</option>
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{lang.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-all"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Pricing</option>
                <option value="fixed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fixed Price</option>
                <option value="hourly" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Hourly Rate</option>
                <option value="milestones" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Milestones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Open Jobs Catalog */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">Available Projects</h3>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-500 bg-slate-200/55 dark:bg-white/5 px-3 py-1 rounded-full uppercase">
              {filteredJobs.length} matches found
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Searching the global marketplace...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-3xl text-center px-4 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-slate-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">No matching jobs found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[280px] mt-1 font-medium leading-relaxed">
                Try widening your language filters or searching for different keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <div 
                  key={job.$id} 
                  className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-3xl shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full font-bold">
                        {job.paymentType} Price
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                        <Globe className="w-3 h-3" />
                        {getLanguageName(job.fromLanguage)} ➔ {getLanguageName(job.toLanguage)}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h4>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 gap-3 border-t sm:border-0 border-slate-100 dark:border-white/5 pt-4 sm:pt-0">
                    <div className="sm:text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Budget</p>
                      <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">${job.budget}</h3>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setApplyModalOpen(true);
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/10 active:scale-95 shrink-0"
                    >
                      View & Bid <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative"
          >
            {bidSuccess ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[500px]">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Proposal Submitted!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
                  Your bid has been delivered. The client will be notified in real-time.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Proposal Application</span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate max-w-md">{selectedJob.title}</h3>
                  </div>
                  <button 
                    onClick={() => setApplyModalOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} className="p-6 space-y-6">
                  {/* Scope Summary */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Source</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{getLanguageName(selectedJob.fromLanguage)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Target</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{getLanguageName(selectedJob.toLanguage)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Pricing</p>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 capitalize">{selectedJob.paymentType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Max Budget</p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">${selectedJob.budget}</p>
                    </div>
                  </div>

                  {/* Proposal Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-widest">
                        Translation Cover Letter / Proposal
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={bidForm.proposal}
                        onChange={(e) => setBidForm({ ...bidForm, proposal: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all resize-none placeholder-slate-400"
                        placeholder="Detail your professional experience, linguistic methods, and milestones for this localization work..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-widest">
                          Your Proposed Bid ($ USD)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            required
                            max={selectedJob.budget * 2}
                            value={bidForm.bidAmount}
                            onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-3 pl-9 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="e.g. 500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-widest">
                          Delivery Time (Days)
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            required
                            min={1}
                            value={bidForm.deliveryDays}
                            onChange={(e) => setBidForm({ ...bidForm, deliveryDays: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-3 pl-9 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="e.g. 5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setApplyModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingBid}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/10 active:scale-95 transition-all"
                    >
                      {submittingBid ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Proposal'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslatorOverview;
