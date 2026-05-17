import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { databases, APPWRITE_CONFIG, ID, Query } from '../../lib/appwrite';
import client from '../../lib/appwrite';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { generateTrzId } from '../../lib/utils/ids';
import { useNotifications } from '../../context/NotificationContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  Briefcase, 
  ArrowLeft, 
  Globe, 
  DollarSign, 
  Calendar,
  Sparkles,
  CheckCheck
} from 'lucide-react';

interface ChatRoom {
  jobId: string;
  jobTitle: string;
  partnerName: string;
  partnerEmail: string;
  partnerId: string;
  fromLanguage: string;
  toLanguage: string;
  budget: number;
  deliveryDays: number;
}

interface MessageDoc {
  $id: string;
  $createdAt: string;
  publicId: string;
  messageText: string;
  senderName: string;
  createdBy: string;
  recipientId: string;
  jobId: string;
}

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { showToast } = useNotifications();
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTranslator = user?.role === 'translator';
  const stateJobId = location.state?.jobId;

  // Auto-activate room from navigation state
  useEffect(() => {
    if (stateJobId && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.jobId === stateJobId);
      if (room) {
        setActiveRoom(room);
      }
    }
  }, [stateJobId, chatRooms]);

  // 1. Fetch Chat Rooms based on active contracts (in_progress)
  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;
      try {
        setLoadingRooms(true);
        if (isTranslator) {
          // Fetch accepted applications for this translator
          const appsRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.jobApplications,
            [
              Query.equal('userId', user.$id),
              Query.equal('status', 'accepted')
            ]
          );

          const rooms = await Promise.all(
            appsRes.documents.map(async (app: any) => {
              try {
                // Fetch parent job details
                const job = await databases.getDocument(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.jobs,
                  app.jobId
                );

                // Fetch company details
                let companyName = 'Expert Company';
                let companyEmail = '';
                try {
                  const company = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.companies,
                    job.createdBy
                  );
                  companyName = company.companyName || company.name || 'Expert Company';
                  companyEmail = company.email || '';
                } catch (e) {
                  // Fallback
                }

                return {
                  jobId: job.$id,
                  jobTitle: job.title,
                  partnerName: companyName,
                  partnerEmail: companyEmail,
                  partnerId: job.createdBy,
                  fromLanguage: job.fromLanguage,
                  toLanguage: job.toLanguage,
                  budget: app.bidAmount || job.budget,
                  deliveryDays: app.deliveryDays || 7
                };
              } catch (err) {
                return null;
              }
            })
          );

          setChatRooms(rooms.filter((r): r is ChatRoom => r !== null));
        } else {
          // Company view: Fetch all jobs created by this company that are in_progress
          const jobsRes = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.jobs,
            [
              Query.equal('createdBy', user.$id),
              Query.equal('status', 'in_progress')
            ]
          );

          const rooms = await Promise.all(
            jobsRes.documents.map(async (job: any) => {
              try {
                // Fetch the accepted job application
                const appsRes = await databases.listDocuments(
                  APPWRITE_CONFIG.databaseId,
                  APPWRITE_CONFIG.collections.jobApplications,
                  [
                    Query.equal('jobId', job.$id),
                    Query.equal('status', 'accepted')
                  ]
                );

                if (appsRes.documents.length === 0) return null;
                const acceptedApp = appsRes.documents[0];

                // Fetch translator details
                let translatorName = 'Expert Translator';
                let translatorEmail = '';
                try {
                  const translator = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translators,
                    acceptedApp.userId
                  );
                  translatorName = translator.name || 'Expert Translator';
                  translatorEmail = translator.email || '';
                } catch (e) {
                  // Fallback
                }

                return {
                  jobId: job.$id,
                  jobTitle: job.title,
                  partnerName: translatorName,
                  partnerEmail: translatorEmail,
                  partnerId: acceptedApp.userId,
                  fromLanguage: job.fromLanguage,
                  toLanguage: job.toLanguage,
                  budget: acceptedApp.bidAmount || job.budget,
                  deliveryDays: acceptedApp.deliveryDays || 7
                };
              } catch (err) {
                return null;
              }
            })
          );

          setChatRooms(rooms.filter((r): r is ChatRoom => r !== null));
        }
      } catch (error: any) {
        console.error('Error fetching chat rooms:', error);
        showToast('Error', 'Failed to load conversations.', 'dispute');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [user, isTranslator]);

  // 2. Fetch Messages when active room changes
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      try {
        const msgsRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.messages,
          [
            Query.equal('jobId', activeRoom.jobId),
            Query.orderAsc('createdAt'),
            Query.limit(100)
          ]
        );
        setMessages(msgsRes.documents as unknown as MessageDoc[]);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // 3. Realtime Appwrite Subscription for new messages
    const unsubscribe = client.subscribe(
      `databases.main.collections.messages.documents`,
      (response: any) => {
        if (response.events.some((e: string) => e.includes('.create'))) {
          const newMsg = response.payload as MessageDoc;
          if (newMsg.jobId === activeRoom.jobId) {
            setMessages(prev => {
              if (prev.some(m => m.$id === newMsg.$id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 50);
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 4. Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !user || sending) return;

    try {
      setSending(true);
      const now = new Date().toISOString();
      const messageDoc = {
        publicId: generateTrzId('MS'),
        entityType: 'message',
        createdAt: now,
        updatedAt: now,
        createdBy: user.$id,
        status: 'active',
        visibility: 'private',
        messageText: newMessage.trim(),
        senderName: user.name || (isTranslator ? 'Translator' : 'Client'),
        recipientId: activeRoom.partnerId,
        jobId: activeRoom.jobId,
        organizationId: isTranslator ? activeRoom.partnerId : user.$id
      };

      const res = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.messages,
        ID.unique(),
        messageDoc
      );

      // Local optimistic update if subscription latency exists
      setMessages(prev => {
        if (prev.some(m => m.$id === res.$id)) return prev;
        return [...prev, res as unknown as MessageDoc];
      });
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      showToast('Error', 'Failed to send message. Please try again.', 'dispute');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-300">
        
        {/* LEFT COLUMN: ACTIVE CHAT ROOMS LIST */}
        <div className={`w-full md:w-80 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl backdrop-blur-xl flex flex-col overflow-hidden transition-all ${
          activeRoom ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Active Workspace Chats
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Structured collaboration for active contracts</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
            {loadingRooms ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Loading channels...</p>
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-slate-50/30 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <Briefcase className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">No Active Contracts</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  Start a contract to open a secure direct-message channel.
                </p>
              </div>
            ) : (
              chatRooms.map((room) => {
                const isActive = activeRoom?.jobId === room.jobId;
                return (
                  <button
                    key={room.jobId}
                    onClick={() => setActiveRoom(room)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 relative ${
                      isActive 
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-400' 
                        : 'bg-white/40 dark:bg-slate-900/20 border-slate-100 dark:border-white/2 hover:border-slate-200 dark:hover:border-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">
                        {room.partnerName}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        Project: {room.jobTitle}
                      </p>
                    </div>
                    {isActive && (
                      <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-ping" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT SCREEN */}
        <div className={`flex-1 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl backdrop-blur-xl flex flex-col overflow-hidden ${
          !activeRoom ? 'hidden md:flex' : 'flex'
        }`}>
          {activeRoom ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button 
                    onClick={() => setActiveRoom(null)}
                    className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-xs truncate">
                      {activeRoom.partnerName}
                    </h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      Contract Workspace: {activeRoom.jobTitle}
                    </p>
                  </div>
                </div>

                {/* PROJECT WORKSPACE SPECS BADGES */}
                <div className="hidden lg:flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    <Globe className="w-3 h-3" />
                    {activeRoom.fromLanguage} ➔ {activeRoom.toLanguage}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <DollarSign className="w-3 h-3" />
                    ${activeRoom.budget}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {activeRoom.deliveryDays} Days
                  </span>
                </div>
              </div>

              {/* MESSAGES LIST VIEW */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/10 dark:bg-slate-950/5">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
                    <div className="w-12 h-12 rounded-full bg-blue-600/5 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-bounce">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Workspace Initialized</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[240px] leading-relaxed">
                      Say hello to {activeRoom.partnerName}! Work together to complete the project successfully.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.createdBy === user?.$id;
                    const dateStr = new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div 
                        key={msg.$id}
                        className={`flex gap-3 max-w-[80%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-slate-500 text-xs ${
                          isOwn 
                            ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400' 
                            : 'bg-slate-100 dark:bg-white/5'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>

                        {/* Bubble */}
                        <div className="space-y-1">
                          <div className={`p-4 rounded-3xl text-xs leading-relaxed ${
                            isOwn 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                          }`}>
                            <p className="whitespace-pre-line">{msg.messageText}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 text-[8px] text-slate-400 dark:text-slate-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span>{dateStr}</span>
                            {isOwn && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* MESSAGE INPUT FORM */}
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/20 flex gap-3 items-center"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Write your message for ${activeRoom.partnerName}...`}
                  className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 transition-all shadow-md shadow-blue-500/10 disabled:opacity-40 disabled:hover:bg-blue-600 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-blue-500/5 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Select a conversation</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed mt-2">
                Click on any active workspace chat from the left panel to securely communicate in real time.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Messages;
