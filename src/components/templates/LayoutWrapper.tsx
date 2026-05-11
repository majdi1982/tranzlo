"use client"

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/organisms/Navbar";
import { Footer } from "@/components/organisms/Footer";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
};
