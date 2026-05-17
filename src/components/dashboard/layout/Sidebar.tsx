import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CreditCard, 
  MessageSquare,
  PlusCircle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isTranslator = user?.role === 'translator';

  // Dynamic Navigation items based on User Role (Permissions-aware)
  const menuItems = isTranslator
    ? [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
        { icon: <Briefcase className="w-5 h-5" />, label: 'Active Jobs', path: '/dashboard/projects' },
        { icon: <FileText className="w-5 h-5" />, label: 'My Proposals', path: '/dashboard/proposals' },
        { icon: <MessageSquare className="w-5 h-5" />, label: 'Messages', path: '/dashboard/messages' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Earnings & Payouts', path: '/dashboard/billing' },
      ]
    : [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
        { icon: <Briefcase className="w-5 h-5" />, label: 'Posted Projects', path: '/dashboard/projects' },
        { icon: <Users className="w-5 h-5" />, label: 'Team Members', path: '/dashboard/team' },
        { icon: <MessageSquare className="w-5 h-5" />, label: 'Messages', path: '/dashboard/messages' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Billing & Escrow', path: '/dashboard/billing' },
      ];

  return (
    <aside className={`fixed left-0 top-20 bottom-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className="p-4" /> {/* Spacing below navbar */}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute right-[-14px] top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1.5 rounded-full text-slate-400 hover:text-slate-950 dark:hover:text-white shadow-md active:scale-90 transition-all z-50 cursor-pointer"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Dynamic CTA based on Role & Collapsed state */}
      <div className="px-4 mb-6 flex justify-center">
        {!isCollapsed ? (
          !isTranslator ? (
            <Link 
              to="/dashboard/post-job"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              Post New Project
            </Link>
          ) : (
            <Link 
              to="/dashboard"
              className="w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 hover:dark:bg-white/10 text-slate-700 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Browse Job Feed
            </Link>
          )
        ) : (
          !isTranslator ? (
            <Link 
              to="/dashboard/post-job"
              title="Post New Project"
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-105 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          ) : (
            <Link 
              to="/dashboard"
              title="Browse Job Feed"
              className="w-12 h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-full font-bold flex items-center justify-center shadow-sm hover:scale-105 transition-all active:scale-95 cursor-pointer"
            >
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </Link>
          )
        )}
      </div>

      {/* Role-Specific Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-xl font-medium transition-all group ${
                isCollapsed ? 'justify-center p-3.5 mx-auto w-12' : 'gap-3 px-4 py-3.5'
              } ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100 hover:dark:bg-white/5 hover:text-slate-900 hover:dark:text-white'
              }`}
            >
              <span className={`transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 group-hover:dark:text-slate-300'}`}>
                {item.icon}
              </span>
              {!isCollapsed && item.label}
              {!isCollapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
