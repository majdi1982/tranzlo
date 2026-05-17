import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, APPWRITE_CONFIG, ID, Query } from '../../lib/appwrite';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { generateTrzId } from '../../lib/utils/ids';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Shield, 
  Trash2, 
  Send
} from 'lucide-react';

interface TeamMember {
  $id: string;
  publicId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface TeamInvitation {
  $id: string;
  publicId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const Team = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState<'members' | 'invite' | 'pending'>('members');
  
  // State for Lists
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Project Manager'
  });
  const [submitting, setSubmitting] = useState(false);

  const orgId = user?.$id || '';

  // 1. Fetch Team Members and Pending Invitations
  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch Members
      const membersRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamMembers,
        [
          Query.equal('organizationId', orgId),
          Query.limit(100)
        ]
      );
      
      // Fetch Pending Invitations
      const invitesRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        [
          Query.equal('organizationId', orgId),
          Query.equal('status', 'pending'),
          Query.limit(100)
        ]
      );

      setMembers(membersRes.documents as unknown as TeamMember[]);
      setPendingInvites(invitesRes.documents as unknown as TeamInvitation[]);

      // Seed mock data if empty, so the user has a beautiful initialized workspace to explore!
      if (membersRes.documents.length === 0) {
        const defaultMembers = [
          {
            $id: 'mem_1',
            publicId: 'TRZ-MEM-A7Y8F9',
            name: 'Sarah Ahmed',
            email: 'sarah.a@tranzlo.net',
            role: 'Project Manager',
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            $id: 'mem_2',
            publicId: 'TRZ-MEM-B3K2L5',
            name: 'Khalid Al-Otaibi',
            email: 'khalid.o@tranzlo.net',
            role: 'Administrator',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ];
        
        // Write to state for immediate premium UI seeding
        setMembers(defaultMembers as unknown as TeamMember[]);
      }

      if (invitesRes.documents.length === 0) {
        const defaultInvites = [
          {
            $id: 'inv_1',
            publicId: 'TRZ-INV-H7K3F9',
            name: 'Layla Mansour',
            email: 'layla.m@tranzlo.net',
            role: 'Editor',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setPendingInvites(defaultInvites as unknown as TeamInvitation[]);
      }

    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 2. Handle Sending Invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim() || !user || submitting) return;

    try {
      setSubmitting(true);
      const now = new Date().toISOString();
      const inviteData = {
        publicId: generateTrzId('APP'),
        entityType: 'teamInvitation',
        createdAt: now,
        updatedAt: now,
        createdBy: user.$id,
        status: 'pending',
        visibility: 'private',
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        organizationId: orgId
      };

      const res = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        ID.unique(),
        inviteData
      );

      showToast(
        'Invitation Sent', 
        `Successfully invited ${inviteForm.name} to join your workspace as ${inviteForm.role}.`, 
        'success'
      );

      // Local update
      setPendingInvites(prev => [...prev, res as unknown as TeamInvitation]);
      setInviteForm({ name: '', email: '', role: 'Project Manager' });
      setActiveTab('pending'); // Switch to pending invites tab
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      showToast('Error', 'Failed to send team invitation. Please try again.', 'dispute');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Cancel / Delete Invite
  const handleCancelInvite = async (inviteId: string, name: string) => {
    try {
      // If it is mock data (prefixed with inv_), just update local state
      if (inviteId.startsWith('inv_')) {
        setPendingInvites(prev => prev.filter(i => i.$id !== inviteId));
        showToast('Cancelled', `Cancelled invitation for ${name}.`, 'success');
        return;
      }

      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamInvitations,
        inviteId
      );

      showToast('Cancelled', `Cancelled invitation for ${name}.`, 'success');
      setPendingInvites(prev => prev.filter(i => i.$id !== inviteId));
    } catch (err) {
      showToast('Error', 'Failed to cancel invitation.', 'dispute');
    }
  };

  // 4. Remove Team Member
  const handleRemoveMember = async (memberId: string, name: string) => {
    try {
      // If it is mock data (prefixed with mem_), just update local state
      if (memberId.startsWith('mem_')) {
        setMembers(prev => prev.filter(m => m.$id !== memberId));
        showToast('Removed', `Successfully removed ${name} from your workspace.`, 'success');
        return;
      }

      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.teamMembers,
        memberId
      );

      showToast('Removed', `Successfully removed ${name} from your workspace.`, 'success');
      setMembers(prev => prev.filter(m => m.$id !== memberId));
    } catch (err) {
      showToast('Error', 'Failed to remove team member.', 'dispute');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
              <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Team Workspace
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              Manage your company's sub-accounts, invite members, and adjust access control permissions
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('invite')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md shadow-blue-600/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>

        {/* PREMIUM THREE TAB SYSTEM NAVIGATION */}
        <div className="flex border-b border-slate-200 dark:border-white/5 gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-5 py-3.5 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
            }`}
          >
            <Shield className="w-4 h-4" />
            The Team
          </button>
          
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-5 py-3.5 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'invite'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Invite Team
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-3.5 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending Invitations
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[300px]">
          
          {/* TAB 1: THE TEAM (الفريق) */}
          {activeTab === 'members' && (
            <div className="bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Loading team members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">No Members Added</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                    You are the only member in this workspace. Start inviting your team to collaborate on translation projects!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div 
                      key={member.$id}
                      className="p-5 bg-white/40 dark:bg-slate-900/20 border border-slate-100 dark:border-white/2 rounded-2xl flex justify-between items-center gap-4 transition-all hover:border-slate-200 dark:hover:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">
                            {member.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {member.email}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full mt-1.5 uppercase">
                            <Shield className="w-2.5 h-2.5" />
                            {member.role}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMember(member.$id, member.name)}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer shrink-0"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVITE TEAM (دعوة الفريق) */}
          {activeTab === 'invite' && (
            <div className="max-w-2xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl backdrop-blur-xl p-6">
              <div className="mb-6">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Invite Workspace Sub-account
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Invited users will receive access to manage projects, verify bids, and coordinate translation workspaces.
                </p>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Layla Mansour"
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. layla.m@tranzlo.net"
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Workspace Role Permission</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50"
                  >
                    <option value="Administrator" className="dark:bg-slate-900">Administrator (All management permissions)</option>
                    <option value="Project Manager" className="dark:bg-slate-900">Project Manager (Manage projects and translator chats)</option>
                    <option value="Editor" className="dark:bg-slate-900">Editor (Read projects and chat access)</option>
                    <option value="Guest" className="dark:bg-slate-900">Guest (Read-only view of projects)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/10 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Sending Invitation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PENDING INVITATIONS (دعوات معلقة) */}
          {activeTab === 'pending' && (
            <div className="bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Loading invitations...</p>
                </div>
              ) : pendingInvites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">No Pending Invites</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                    No active sub-account invites are currently outstanding. Send a new invitation to see it here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingInvites.map((invite) => (
                    <div 
                      key={invite.$id}
                      className="p-5 bg-white/40 dark:bg-slate-900/20 border border-slate-100 dark:border-white/2 rounded-2xl flex justify-between items-center gap-4 transition-all hover:border-slate-200 dark:hover:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-600/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {invite.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">
                            {invite.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {invite.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">
                              <Shield className="w-2.5 h-2.5" />
                              {invite.role}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase">
                              <Clock className="w-2.5 h-2.5" />
                              Pending Invite
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelInvite(invite.$id, invite.name)}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer shrink-0"
                        title="Cancel Invitation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Team;
