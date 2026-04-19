import React from "react";
import Link from "next/link";
import { Languages } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Languages className="h-5 w-5" />
              </span>
              <span>Tranzlo</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting companies with translators through a calm, structured marketplace.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-primary">Marketplace</Link></li>
              <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/jobs" className="hover:text-primary">Find Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Join Us</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Stay updated with the latest translation opportunities.
            </p>
            <div className="flex gap-4">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tranzlo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
