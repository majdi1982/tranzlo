import { createSessionClient } from '@/lib/server/appwrite';
import { redirect } from 'next/navigation';

/**
 * /dashboard — smart router.
 * Reads the user's Appwrite labels and redirects to the correct dashboard.
 * admin  → /dashboard/admin
 * company → /dashboard/company
 * default → /dashboard/translator
 */
export default async function DashboardRootPage() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    if (user.labels?.includes('admin')) {
      redirect('/dashboard/admin');
    }

    if (user.labels?.includes('company')) {
      redirect('/dashboard/company');
    }

    redirect('/dashboard/translator');
  } catch {
    // No valid session — middleware should have caught this, but fallback safely
    redirect('/login');
  }
}
