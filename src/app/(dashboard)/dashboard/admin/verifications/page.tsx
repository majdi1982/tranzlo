import { createAdminClient } from '@/lib/server/appwrite';
import { verifyTranslator, revokeTranslatorVerification } from '@/app/actions/admin';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export default async function AdminVerificationsPage() {
  let allUsers: any[] = [];

  try {
    const { users } = await createAdminClient();
    const res = await users.list();
    allUsers = res.users;
  } catch (err) {
    console.error('Could not list users', err);
  }

  const unverifiedTranslators = allUsers.filter(u => !u.labels?.includes('verified_translator') && !u.labels?.includes('admin'));
  const verifiedTranslators = allUsers.filter(u => u.labels?.includes('verified_translator'));

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-6 flex flex-col gap-2">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[var(--accent)]">Tranzlo.</h2>
          <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/30 dark:text-red-400">Admin Panel</span>
        </div>
        <a href="/dashboard/admin" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">Overview</a>
        <a href="/dashboard/admin/users" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">Users</a>
        <a href="/dashboard/admin/jobs" className="flex items-center gap-3 text-[var(--text-secondary)] font-medium p-3 rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-all">Jobs</a>
        <a href="/dashboard/admin/verifications" className="flex items-center gap-3 text-[var(--accent)] font-medium p-3 rounded-xl bg-[var(--accent)]/10">Verifications</a>
      </aside>

      <main className="flex-1 p-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Translator Verifications</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {unverifiedTranslators.length} awaiting verification · {verifiedTranslators.length} verified
          </p>
        </div>

        {/* Awaiting Verification */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Awaiting Verification</h2>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/30 dark:border-amber-800/50 dark:bg-amber-900/10 overflow-hidden shadow-sm">
            {unverifiedTranslators.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-secondary)]">
                <ShieldCheck className="mx-auto h-10 w-10 opacity-30 mb-3" />
                <p>All translators are verified!</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-amber-50 dark:bg-amber-900/20 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/50 dark:divide-amber-800/30">
                  {unverifiedTranslators.map((user) => (
                    <tr key={user.$id} className="hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{user.name || 'Unnamed'}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{user.email}</td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => { await verifyTranslator(user.$id); }}>
                          <button type="submit" className="flex items-center gap-1 ml-auto rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" /> Approve
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Already Verified */}
        {verifiedTranslators.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Verified Translators</h2>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {verifiedTranslators.map((user) => (
                    <tr key={user.$id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          {user.name}
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)]">{user.email}</td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => { await revokeTranslatorVerification(user.$id); }}>
                          <button type="submit" className="flex items-center gap-1 ml-auto rounded-lg border border-[var(--border)] bg-[var(--bg-main)] px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                            <ShieldOff className="h-3.5 w-3.5" /> Revoke
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
