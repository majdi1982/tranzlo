import { Languages } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-3xl text-primary">
            <Languages className="h-8 w-8" />
            <span>Tranzlo</span>
          </Link>
          <p className="text-sm text-muted-foreground">The premier language marketplace</p>
        </div>
        {children}
        <div className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tranzlo. Secure Authentication.
        </div>
      </div>
    </div>
  );
}
