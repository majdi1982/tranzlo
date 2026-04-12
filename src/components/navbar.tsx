'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthNav } from './AuthNav';

import { getUser } from '@/app/actions/auth';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
    async function checkUser() {
      try {
        const u = await getUser();
        if (u) setUser(u);
      } catch (e) {}
    }
    checkUser();
  }, [pathname]); // Refresh on navigation

  const navLinks = [
    { name: 'Marketplace', href: '/jobs' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Professional Hub', href: '/community' },
    { name: 'Contact', href: '/contact' },
  ];

  const role = user?.labels?.includes('company') ? 'company' : (user?.labels?.includes('admin') ? 'admin' : 'translator');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-secondary)]/60 backdrop-blur-2xl transition-all duration-500">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-10">
        
        {/* 1. Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl group-hover:rotate-6 transition-all duration-500">
              <Globe className="h-6.5 w-6.5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[var(--text-primary)] font-outfit uppercase">Tranzlo</span>
          </Link>
        </div>

        {/* 2. Desktop Navigation (Centered) */}
        <nav className="hidden md:flex items-center gap-2 p-1 bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl shadow-inner backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                pathname === link.href 
                  ? 'bg-[var(--accent)] text-white shadow-lg' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. Right Actions (Auth + Mobile Toggle) */}
        <div className="flex items-center gap-4">
          <AuthNav />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden h-10 w-10 flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all overflow-hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 4. Redesigned Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[80px] border-t border-[var(--border)] bg-[var(--bg-secondary)]/95 backdrop-blur-3xl animate-in slide-in-from-top-full duration-500 z-50 shadow-2xl overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="px-6 py-10 space-y-10">
            <nav className="flex flex-col gap-2">
              <p className="px-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Explore Platform</p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                    pathname === link.href 
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)]' 
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
                  }`}
                >
                  {link.name}
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-0 group-focus:opacity-100" />
                </Link>
              ))}
            </nav>

            <div className="pt-8 border-t border-[var(--border)]">
              {user ? (
                <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Your Control Center</p>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-4 w-full p-4 rounded-3xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <Globe className="h-5 w-5" />
                    Enter Community Hub
                  </Link>
                  <Link 
                    href={`/dashboard/${role}/profile`} 
                    className="flex items-center gap-4 w-full p-4 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    My Public Profile
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center p-4 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center p-4 rounded-3xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest shadow-xl"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Minimal placeholder icons if they were missing or needed for the mobile menu expansion
function User(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
