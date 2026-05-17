import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Languages, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Settings, 
  LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand/Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-105 transition-transform">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                Tranzlo
              </span>
            </Link>
          </div>

          {/* Public Links & Actions */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white transition-colors font-medium">Home</Link>
            <Link to="/marketplace" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white transition-colors font-medium">Marketplace</Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white transition-colors font-medium">About</Link>
            
            <ThemeToggle />

            {user ? (
              // Premium User Avatar Dropdown (Dropdown is aligned to the right)
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-full transition-all active:scale-95 cursor-pointer select-none group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-600/10 text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 group-hover:dark:text-white transition-colors">
                    {user?.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Click-away overlay */}
                {isDropdownOpen && (
                  <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                )}

                {/* Dropdown Menu Container */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl py-2.5 z-40 animate-in fade-in slide-in-from-top-3 duration-200 backdrop-blur-sm">
                    
                    {/* Header Info */}
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-1.5">{user?.email}</p>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {user?.role === 'translator' ? 'Translator' : 'Company Admin'}
                      </span>
                    </div>

                    <div className="py-1">
                      {/* Dashboard link - hidden if already inside dashboard */}
                      {!isDashboard && (
                        <Link 
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-650 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-white/5 hover:text-slate-900 hover:dark:text-white transition-all font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          Go to Dashboard
                        </Link>
                      )}

                      <Link 
                        to="/dashboard/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-650 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-white/5 hover:text-slate-900 hover:dark:text-white transition-all font-medium"
                      >
                        <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        Account Settings
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                    <div className="py-1">
                      {/* Sign Out Button */}
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:dark:bg-rose-500/5 transition-all font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Log in</Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-full font-bold transition-all shadow-md cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 dark:text-white p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-4 py-6 space-y-4 shadow-xl">
          <Link to="/" className="block text-slate-600 dark:text-slate-300 font-medium">Home</Link>
          <Link to="/marketplace" className="block text-slate-600 dark:text-slate-300 font-medium">Marketplace</Link>
          {!isDashboard && user && (
            <Link to="/dashboard" className="block text-slate-600 dark:text-slate-300 font-medium">Dashboard</Link>
          )}
          
          <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Theme Mode</span>
              <ThemeToggle />
            </div>
            {user ? (
              <button 
                onClick={logout} 
                className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" className="text-center py-2 text-slate-700 dark:text-white font-medium">Log in</Link>
                <Link to="/register" className="text-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
