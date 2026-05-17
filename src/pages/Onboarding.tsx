import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { account, databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { generateTrzId } from '../lib/utils/ids';
import { UserCircle, Building2, ChevronRight, Loader2, Languages } from 'lucide-react';

const Onboarding = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [role, setRole] = useState<'translator' | 'company' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!role || !user) return;
    setLoading(true);
    try {
      // Update Appwrite Preferences for fast role checking
      await account.updatePrefs({ role });

      const collectionId = role === 'translator' 
        ? APPWRITE_CONFIG.collections.translators 
        : APPWRITE_CONFIG.collections.companies;

      const publicId = generateTrzId('USER');
      const now = new Date().toISOString();

      try {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          collectionId,
          user.$id,
          {
            publicId,
            entityType: role,
            createdAt: now,
            updatedAt: now,
            createdBy: user.$id,
            status: 'active',
            visibility: 'private',
            userId: user.$id,
            name: user.name,
            email: user.email,
            role: role,
            ...(role === 'company' ? { companyName: user.name } : {})
          }
        );
      } catch (dbError: any) {
        // If document already exists, we can safely proceed
        if (dbError.code === 409 || dbError.message?.includes('already exists')) {
          console.log('Profile document already exists, continuing...');
        } else {
          throw dbError;
        }
      }

      showToast('Welcome!', `Onboarding completed as ${role === 'translator' ? 'Translator' : 'Company'}.`, 'success');
      
      await refreshUser();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      showToast('Onboarding Failed', error.message || 'Please check your connection.', 'dispute');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-600/20">
            <Languages className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">How will you use Tranzlo?</h1>
          <p className="text-slate-400 text-lg">Choose your path to get started with the marketplace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setRole('translator')}
            className={`p-8 rounded-3xl border-2 transition-all text-left group relative overflow-hidden ${
              role === 'translator' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-white/5 bg-slate-900/50 hover:border-white/20'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              role === 'translator' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              <UserCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">I'm a Translator</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Build your professional profile, bid on projects, and earn by providing linguistic expertise.
            </p>
            <div className={`absolute top-4 right-4 transition-opacity ${role === 'translator' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setRole('company')}
            className={`p-8 rounded-3xl border-2 transition-all text-left group relative overflow-hidden ${
              role === 'company' 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-white/5 bg-slate-900/50 hover:border-white/20'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              role === 'company' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">I'm a Company</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Post translation jobs, find top talent, and manage enterprise-level localization projects.
            </p>
            <div className={`absolute top-4 right-4 transition-opacity ${role === 'company' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleFinish}
            disabled={!role || loading}
            className="px-12 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-3 shadow-2xl shadow-white/10"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Continue to Dashboard <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
