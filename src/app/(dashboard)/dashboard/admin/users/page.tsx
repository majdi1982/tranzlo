import { createAdminClient } from '@/lib/server/appwrite';
import { UserCheck, UserX, ShieldPlus, ShieldOff } from 'lucide-react';
import { verifyTranslator, revokeTranslatorVerification, banUser, unbanUser } from '@/app/actions/admin';

export default async function AdminUsersPage() {
  let userList: any[] = [];
  let totalUsers = 0;

  try {
    const { users } = await createAdminClient();
    const res = await users.list();
    userList = res.users;
    totalUsers = res.total;
  } catch (err) {
    console.error('Could not list users', err);
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">User Management</h1>
        <p className="text-[var(--text-secondary)] mt-1">{totalUsers} registered users on the platform.</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Labels</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">No users found.</td>
                </tr>
              ) : userList.map((user) => (
                <tr key={user.$id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      {user.name || 'Unnamed'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.labels || ['user']).map((label: string) => (
                        <span key={label} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
                          ${label === 'admin' ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400' :
                            label === 'verified' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-[var(--bg-main)] text-[var(--text-secondary)] ring-[var(--border)]'}`}>
                          {label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
                      ${user.status ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {user.status ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Verify Translator */}
                      {!user.labels?.includes('verified') ? (
                        <form action={verifyTranslator.bind(null, user.$id) as any}>
                          <button type="submit" title="Verify Translator" className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <ShieldPlus className="h-3.5 w-3.5" /> Verify
                          </button>
                        </form>
                      ) : (
                        <form action={revokeTranslatorVerification.bind(null, user.$id) as any}>
                          <button type="submit" title="Revoke Verification" className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-main)] px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors">
                            <ShieldOff className="h-3.5 w-3.5" /> Revoke
                          </button>
                        </form>
                      )}
                      {/* Ban / Unban */}
                      {user.status ? (
                        <form action={banUser.bind(null, user.$id) as any}>
                          <button type="submit" title="Ban User" className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <UserX className="h-3.5 w-3.5" /> Ban
                          </button>
                        </form>
                      ) : (
                        <form action={unbanUser.bind(null, user.$id) as any}>
                          <button type="submit" title="Unban User" className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <UserCheck className="h-3.5 w-3.5" /> Unban
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
