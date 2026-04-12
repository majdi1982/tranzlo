import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { createSessionClient } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role: 'admin' | 'company' | 'translator' = 'translator';
  
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    
    if (user.labels?.includes('admin')) {
      role = 'admin';
    } else if (user.labels?.includes('company')) {
      role = 'company';
    }
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <DashboardSidebar role={role} />
        <main className="flex-1 bg-[var(--bg-main)]">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
