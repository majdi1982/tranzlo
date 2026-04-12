'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuthNav } from './AuthNav';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Jobs', href: '/jobs' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Tranzlo</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[var(--accent)] ${
                pathname === link.href ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <AuthNav />
          
          {/* Mobile Menu Button - only visible on small screens */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[var(--text-primary)] p-2 hover:bg-[var(--bg-main)] rounded-xl transition-all"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]"
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
              <Link 
                href="/login" 
                className="w-full text-center text-sm font-medium text-[var(--text-secondary)]"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm font-medium text-white shadow-sm"
                onClick={() => setIsOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
