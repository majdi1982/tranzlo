"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOnboarded, setIsOnboarded] = React.useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {
      const userId = user.$id;
      const role = user.prefs?.role || "translator";

      async function checkOnboarding() {
        try {
          const services = getServices();
          let profile = null;
          
          if (role === "translator") {
            profile = await services.profile.getTranslatorProfile(userId);
          } else {
            profile = await services.profile.getCompanyProfile(userId);
          }

          const complete = !!profile?.onboardingComplete;
          setIsOnboarded(complete);

          if (!complete && pathname !== "/onboarding") {
            router.replace("/onboarding");
          }
        } catch (err) {
          console.error("Error checking onboarding status:", err);
          setIsOnboarded(false);
        } finally {
          setCheckingOnboarding(false);
        }
      }

      checkOnboarding();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user, loading, router, pathname]);

  if (loading || (user && checkingOnboarding)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  if (isOnboarded === false && pathname !== "/onboarding") {
    return null;
  }

  return <>{children}</>;
}
