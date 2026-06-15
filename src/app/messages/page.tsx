"use client";

import * as React from "react";
import { Send, Loader2, MessageSquare, ArrowLeft, User, Paperclip } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message } from "@/types";

function parseMessageContent(text: string, isMe: boolean) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      const isStorage = part.includes('/v1/storage/buckets/');
      if (isStorage) {
        return (
          <div key={i} className="my-2 block">
            <a 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors ${
                isMe 
                  ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download File
            </a>
          </div>
        );
      }
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:opacity-80 break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>;
  });
}

export default function MessagesPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = React.useState<string | null>(null);
  const [newMessage, setNewMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const [showList, setShowList] = React.useState(true);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function load() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const convs = await services.message.getConversations(user.$id);
        setConversations(convs.sort((a, b) => {
          const aTime = a.lastMessageAt || a.createdAt;
          const bTime = b.lastMessageAt || b.createdAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        }));

        const allJobs = await services.job.getJobs();
        setJobs(allJobs);

        let allApps: any[] = [];
        try {
          if (user.prefs?.role === "translator") {
            allApps = await services.application.getMyApplications(user.$id);
          } else {
            const myJobs = allJobs.filter(j => j.companyId === user.$id);
            const appsList = await Promise.all(myJobs.map(j => services.application.getApplications(j.$id)));
            allApps = appsList.flat();
          }
        } catch {}
        setApplications(allApps);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.$id]);

  const getConvJob = (conv: Conversation) => jobs.find((j) => j.$id === conv.jobId);
  const getConvLanguagePair = (conv: Conversation) => {
    const job = getConvJob(conv);
    if (!job) return null;
    const transId = conv.participants.find(p => p !== user?.$id);
    const app = applications.find(a => a.jobId === job.$id && (a.translatorId === user?.$id || a.translatorId === transId));
    return app?.languagePair || (job.targetLanguage ? `${job.sourceLanguage.toUpperCase()} → ${job.targetLanguage.split(",")[0].trim().toUpperCase()}` : "");
  };

  React.useEffect(() => {
    async function loadMessages() {
      if (!selectedConv) return;
      try {
        const services = getServices();
        const msgs = await services.message.getMessages(selectedConv);
        setMessages(msgs);
        await services.message.markAsRead(selectedConv, user?.$id || "");
      } catch {
        // ignore
      }
    }
    loadMessages();
  }, [selectedConv, user?.$id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    try {
      const services = getServices();
      const msg = await services.message.sendMessage({
        conversationId: selectedConv,
        content: newMessage.trim(),
        senderId: user?.$id || "",
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      setConversations((prev) =>
        prev.map((c) =>
          c.$id === selectedConv
            ? { ...c, lastMessagePreview: newMessage.trim(), lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;
    setUploadingFile(true);
    try {
      const { getStorage, BUCKETS, ID } = await import("@/lib/appwrite");
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.TRANSLATOR_DOCUMENTS, ID.unique(), file);
      const fileUrl = `${storage.client.config.endpoint}/storage/buckets/${BUCKETS.TRANSLATOR_DOCUMENTS}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;
      
      const services = getServices();
      const msg = await services.message.sendMessage({
        conversationId: selectedConv,
        content: fileUrl,
        senderId: user?.$id || "",
      });
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.$id === selectedConv
            ? { ...c, lastMessagePreview: "Sent a file", lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  }

  function selectConversation(convId: string) {
    setSelectedConv(convId);
    setShowList(false);
  }

  const otherParticipantId = (conv: Conversation) =>
    conv.participants.find((p) => p !== user?.$id) || "Unknown";

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>

          <Card className="overflow-hidden">
            <div className="flex h-[calc(100vh-16rem)]">
              {/* Conversation List */}
              <div className={`w-full sm:w-80 border-r shrink-0 ${showList ? "block" : "hidden sm:block"}`}>
                <div className="p-3 border-b">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Conversations
                  </h2>
                </div>
                <ScrollArea className="h-[calc(100%-3rem)]">
                  {loading ? (
                    <div className="space-y-2 p-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.$id}
                        onClick={() => selectConversation(conv.$id)}
                        className={`w-full text-left p-3 hover:bg-muted/50 transition-colors border-b ${
                          selectedConv === conv.$id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {otherParticipantId(conv)}
                            </p>
                            {getConvJob(conv) && (
                              <p className="text-[10px] text-teal-600 font-bold uppercase truncate mt-0.5">
                                {getConvJob(conv)?.title} • {getConvLanguagePair(conv)}
                              </p>
                            )}
                            {conv.lastMessagePreview && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {conv.lastMessagePreview}
                              </p>
                            )}
                          </div>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(conv.lastMessageAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col ${!showList ? "block" : "hidden sm:flex"}`}>
                {selectedConv ? (
                  <>
                    {/* Responsive Chat Header */}
                    <div className="flex items-center gap-3 p-3 border-b bg-muted/10">
                      <Button variant="ghost" size="icon" onClick={() => setShowList(true)} className="sm:hidden">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {otherParticipantId(conversations.find((c) => c.$id === selectedConv)!)}
                        </p>
                        {getConvJob(conversations.find((c) => c.$id === selectedConv)!) && (
                          <p className="text-[10px] text-teal-600 font-bold uppercase truncate mt-0.5">
                            {getConvJob(conversations.find((c) => c.$id === selectedConv)!)?.title} • {getConvLanguagePair(conversations.find((c) => c.$id === selectedConv)!)}
                          </p>
                        )}
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        {messages.length === 0 ? (
                          <p className="text-center text-sm text-muted-foreground py-8">
                            No messages yet. Start the conversation!
                          </p>
                        ) : (
                          messages.map((msg) => {
                            const isMe = msg.senderId === user?.$id;
                            return (
                              <div key={msg.$id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                    isMe
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <div>{parseMessageContent(msg.content, isMe)}</div>
                                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>

                    <Separator />

                    <form onSubmit={handleSend} className="flex items-center gap-2 p-3">
                      <div className="relative">
                        <input type="file" id="chat-file-upload" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                        <label htmlFor="chat-file-upload" className={`cursor-pointer h-10 w-10 shrink-0 flex items-center justify-center rounded-md border bg-muted/30 transition-colors ${uploadingFile ? "opacity-50" : "hover:bg-muted/50"}`}>
                          {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Paperclip className="h-4 w-4 text-muted-foreground" />}
                        </label>
                      </div>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">Select a conversation</h3>
                      <p className="text-sm text-muted-foreground">Choose a conversation from the list to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
