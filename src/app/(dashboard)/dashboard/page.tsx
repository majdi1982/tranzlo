import { createSessionClient } from '@/lib/server/appwrite';
import { getHubData } from '@/app/actions/hub';
import { redirect } from 'next/navigation';
import HubSidebarLeft from '@/components/dashboard/hub/HubSidebarLeft';
import HubFeed from '@/components/dashboard/hub/HubFeed';
import HubSidebarRight from '@/components/dashboard/hub/HubSidebarRight';

export default async function DashboardRootPage() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    // Prepare profile data for sidebar
    const role = user.labels?.includes('company') ? 'company' : (user.labels?.includes('admin') ? 'admin' : 'translator');
    const profileData = {
      id: user.$id,
      name: user.name,
      role: role,
      memberSince: new Date(user.$createdAt).getFullYear().toString(),
      rating: 4.8, // Fallback/Placeholder
      location: 'New York, USA', // Sample
    };

    // Fetch Live Hub Data
    const hubResult = await getHubData(user.$id, role);

    return (
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Left - Profile & Tools */}
          <div className="lg:col-span-1 hidden lg:block overflow-y-auto no-scrollbar max-h-screen sticky top-24">
             <HubSidebarLeft user={profileData} />
          </div>

          {/* Central Feed - High Activity */}
          <div className="lg:col-span-2 flex flex-col gap-8">
             <HubFeed 
               userRole={profileData.role} 
               initialJobs={hubResult.jobs}
               initialMyJobs={hubResult.myJobs}
               initialCommunity={hubResult.community}
             />
          </div>

          {/* Sidebar Right - Widgets & Community */}
          <div className="lg:col-span-1 hidden lg:block overflow-y-auto no-scrollbar max-h-screen sticky top-24">
             <HubSidebarRight />
          </div>

        </div>
      </div>
    );
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const errorMessage = err?.message || 'invalid_session';
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }
}
