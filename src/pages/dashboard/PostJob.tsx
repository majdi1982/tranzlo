import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { JobService } from '../../lib/services/jobService';
import { useAuth } from '../../context/AuthContext';
import { LANGUAGES } from '../../constants/languages';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Layers, 
  Globe, 
  Lock, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Languages as LangIcon,
  ArrowRightLeft
} from 'lucide-react';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Security: Only allow Company Admin role to access job posting workflow
  useEffect(() => {
    if (user && user.role === 'translator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    paymentType: 'fixed' as 'fixed' | 'hourly' | 'milestones',
    budget: '',
    fromLanguage: 'en',
    toLanguage: 'ar',
    isInviteOnly: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role === 'translator') return;
    setLoading(true);
    try {
      await JobService.createJob({
        ...formData,
        budget: parseInt(formData.budget),
        createdBy: user.$id,
        organizationId: user.profile?.companyId || null,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Failed to post job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Job Posted Successfully!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your project is now live and visible to translators.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Post a New Job</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Fill in the details to find the perfect translation expert.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Main Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm backdrop-blur-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Job Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-slate-900 dark:text-white text-lg focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                      placeholder="e.g. Website Localization for E-commerce Platform"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Source Language</label>
                      <div className="relative">
                        <LangIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <select
                          value={formData.fromLanguage}
                          onChange={(e) => setFormData({ ...formData, fromLanguage: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-11 pr-6 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none transition-all cursor-pointer"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                              {lang.name} ({lang.nativeName})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center justify-center pt-8">
                      <ArrowRightLeft className="w-5 h-5 text-slate-450 dark:text-slate-600" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Target Language</label>
                      <div className="relative">
                        <LangIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <select
                          value={formData.toLanguage}
                          onChange={(e) => setFormData({ ...formData, toLanguage: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-11 pr-6 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none transition-all cursor-pointer"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                              {lang.name} ({lang.nativeName})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Description</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all resize-none placeholder-slate-400"
                      placeholder="Describe the project scope, required languages, and special instructions..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Settings */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Pricing & Visibility</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Payment Type</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'fixed', icon: <DollarSign className="w-4 h-4" />, label: 'Fixed Price' },
                        { id: 'hourly', icon: <Clock className="w-4 h-4" />, label: 'Hourly Rate' },
                        { id: 'milestones', icon: <Layers className="w-4 h-4" />, label: 'Milestones' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentType: type.id as any })}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                            formData.paymentType === type.id 
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/5 text-slate-650 dark:text-slate-400 hover:border-slate-350 dark:hover:border-white/20'
                          }`}
                        >
                          {type.icon}
                          <span className="font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Budget (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="number"
                        required
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isInviteOnly: !formData.isInviteOnly })}
                      className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {formData.isInviteOnly ? <Lock className="w-5 h-5 text-amber-500 dark:text-amber-400" /> : <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{formData.isInviteOnly ? 'Invite Only' : 'Public Post'}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Visibility Settings</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.isInviteOnly ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isInviteOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3 group transition-all active:scale-95 cursor-pointer"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    Post Job Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostJob;
