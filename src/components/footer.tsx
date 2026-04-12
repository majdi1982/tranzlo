import * as React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 xl:gap-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="Tranzlo Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Tranzlo</span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xs">
              The premier marketplace connecting global businesses with verified professional translators.
            </p>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Product</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/jobs" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Find Jobs</Link></li>
              <li><Link href="/pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Pricing</Link></li>
              <li><Link href="/community" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Company</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/blog" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/legal/terms" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/legal/privacy" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/refund" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Refund Policy</Link></li>
              <li><Link href="/legal/cookies" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Cookies Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            &copy; {currentYear} Tranzlo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social SVGs would go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
