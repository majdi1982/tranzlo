import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/layout/DashboardLayout';
import CompanyOverview from '../components/dashboard/company/CompanyOverview';
import TranslatorOverview from '../components/dashboard/translator/TranslatorOverview';
import PostJob from './dashboard/PostJob';
import Projects from './dashboard/Projects';
import Messages from './dashboard/Messages';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect to onboarding if role is not set in preferences
  if (!user.role) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <Routes>
      <Route 
        index 
        element={
          <DashboardLayout>
            {user.role === 'translator' ? <TranslatorOverview /> : <CompanyOverview />}
          </DashboardLayout>
        } 
      />
      <Route path="post-job" element={<PostJob />} />
      <Route path="projects" element={<Projects />} />
      <Route path="proposals" element={<Projects />} />
      <Route path="messages" element={<Messages />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default Dashboard;
