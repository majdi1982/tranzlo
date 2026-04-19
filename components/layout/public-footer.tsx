import Link from "next/link";
import { Languages } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Languages className="h-5 w-5" />
              </span>
              <span>Tranzlo</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A production-minded translation marketplace for companies, translators, and admins.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace">Marketplace</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/help-center">Help Center</Link></li>
              <li><Link href="/refund-policy">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tranzlo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

