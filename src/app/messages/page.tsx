"use client";

import * as React from "react";
import { Send, Loader2, MessageSquare, ArrowLeft, User } from "lucide-react";
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

export default function MessagesPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = React.useState<string | null>(null);
  const [newMessage, setNewMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [showList, setShowList] = React.useState(true);

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
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.$id]);

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
                    <div className="flex items-center gap-2 p-3 border-b sm:hidden">
                      <Button variant="ghost" size="icon" onClick={() => setShowList(true)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <p className="text-sm font-medium truncate">
                        {otherParticipantId(conversations.find((c) => c.$id === selectedConv)!)}
                      </p>
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
                                  <p>{msg.content}</p>
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
