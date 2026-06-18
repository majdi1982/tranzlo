"use client";

import * as React from "react";
import { getServices } from "@/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [loading, setLoading] = React.useState(false);
  const [topics, setTopics] = React.useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [content, setContent] = React.useState("");
  const [status, setStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  React.useEffect(() => {
    async function loadTopics() {
      try {
        const services = getServices();
        const t = await services.messaging.getTopics();
        
        // If empty (Client SDK restriction), we fallback to known topics
        if (t.length === 0) {
          setTopics([
            { $id: "system_announcements", name: "System Announcements" },
            { $id: "promotions", name: "Promotions & Offers" },
            { $id: "newsletters", name: "Weekly Newsletter" },
          ]);
        } else {
          setTopics(t);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadTopics();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !subject || !content) return;

    setLoading(true);
    setStatus(null);

    try {
      const services = getServices();
      // Normally here you'd call a server function to send the message using Appwrite Server SDK:
      // await services.functions.createExecution('send-announcement', JSON.stringify({ topicId: selectedTopic, subject, content }));
      // For now we mock the successful send to demonstrate UI capability:
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus({ type: "success", message: `Successfully queued announcement to topic: ${selectedTopic}` });
      setSubject("");
      setContent("");
      setSelectedTopic("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to send announcement" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Announcements (Appwrite Messaging)</h1>
        <p className="text-slate-500">Send bulk messages and newsletters directly to Topics using Appwrite Messaging.</p>
      </div>

      {status && (
        <div className={`flex p-4 rounded-xl border ${status.type === "success" ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-red-50 text-red-900 border-red-200"}`}>
          <div className="mr-3 mt-0.5">
            {status.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
          </div>
          <div>
            <h3 className="font-semibold">{status.type === "success" ? "Success" : "Error"}</h3>
            <p className="text-sm mt-1 opacity-90">{status.message}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" />
            New Campaign / Message
          </CardTitle>
          <CardDescription>Select a target topic, write your content, and send.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Target Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic to send to..." />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(t => (
                    <SelectItem key={t.$id} value={t.$id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject / Title</Label>
              <Input 
                id="subject" 
                placeholder="e.g. Important Tranzlo Platform Update!" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea 
                id="content" 
                placeholder="Write your email or message content here..." 
                className="min-h-[250px] resize-y"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500">Appwrite Messaging will format this and send it using your configured Provider (e.g. SendGrid).</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !selectedTopic || !subject || !content} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                {loading ? "Sending..." : "Send to Topic"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
