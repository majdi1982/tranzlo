"use client";

import * as React from "react";
import { 
  Loader2, CheckCircle2, XCircle, ArrowLeft, Globe, 
  MessageSquare, Calendar, ChevronRight, FileText, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES } from "@/data/languages";
import { Label } from "@/components/ui/label";

interface LanguageRequest {
  $id: string;
  userId: string;
  translatorName: string;
  currentLanguages: string;
  requestedLanguages: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLanguageRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<LanguageRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"pending" | "history">("pending");
  
  // Rejection modal state
  const [rejectingRequest, setRejectingRequest] = React.useState<LanguageRequest | null>(null);
  const [rejectionNote, setRejectionNote] = React.useState("");
  const [submittingAction, setSubmittingAction] = React.useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/language-requests");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to load language requests.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: LanguageRequest) => {
    if (submittingAction) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/language-requests/${request.$id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve request");

      toast({
        title: "Request Approved",
        description: `Successfully updated working languages for ${request.translatorName}.`,
        variant: "success"
      });

      // Update local state
      setRequests(prev => prev.map(r => r.$id === request.$id ? { ...r, status: "approved", updatedAt: new Date().toISOString() } : r));
    } catch (err: any) {
      toast({
        title: "Approval Failed",
        description: err.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingRequest || submittingAction) return;
    if (!rejectionNote.trim()) {
      toast({
        title: "Note Required",
        description: "Please provide a brief reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/language-requests/${rejectingRequest.$id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "rejected", 
          adminNote: rejectionNote.trim() 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject request");

      toast({
        title: "Request Rejected",
        description: `Rejected language change request for ${rejectingRequest.translatorName}.`,
        variant: "success"
      });

      // Update local state
      setRequests(prev => prev.map(r => r.$id === rejectingRequest.$id ? { 
        ...r, 
        status: "rejected", 
        adminNote: rejectionNote.trim(), 
        updatedAt: new Date().toISOString() 
      } : r));
      
      setRejectingRequest(null);
      setRejectionNote("");
    } catch (err: any) {
      toast({
        title: "Rejection Failed",
        description: err.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const parseLanguages = (jsonStr: string) => {
    try {
      const codes = JSON.parse(jsonStr);
      if (Array.isArray(codes)) {
        return codes.map(code => LANGUAGES.find(l => l.code === code)?.name || code).join(", ");
      }
      return jsonStr;
    } catch {
      return jsonStr;
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const historicalRequests = requests.filter(r => r.status !== "pending");

  const displayedRequests = activeTab === "pending" ? pendingRequests : historicalRequests;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-teal-500" />
            Language Change Requests
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review and manage requests from translators wanting to change their working languages.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-border/40 pb-px">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "pending"
              ? "border-teal-500 text-teal-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Approval ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "history"
              ? "border-teal-500 text-teal-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Processed History ({historicalRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : displayedRequests.length === 0 ? (
        <Card className="border-border/40 bg-accent/5 rounded-2xl p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/5 text-teal-600 mb-4">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm text-foreground">No requests found</h3>
          <p className="text-3xs text-muted-foreground max-w-md mx-auto mt-1">
            {activeTab === "pending" 
              ? "All caught up! There are no pending language change requests to review."
              : "No historical language change requests recorded."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map((req) => (
            <Card key={req.$id} className="glass-card border-border/40 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5 pb-3 bg-muted/10 border-b border-border/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{req.translatorName}</span>
                    <Badge variant="outline" className="text-4xs font-mono uppercase bg-background/50 border-border/40">
                      ID: {req.userId.slice(-6)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-3xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Requested on {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <Badge 
                  variant="outline" 
                  className={`text-4xs uppercase px-2.5 py-0.5 rounded-full font-bold ${
                    req.status === "approved" 
                      ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" 
                      : req.status === "rejected"
                      ? "bg-rose-500/5 text-rose-600 border-rose-500/20"
                      : "bg-amber-500/5 text-amber-600 border-amber-500/20"
                  }`}
                >
                  {req.status}
                </Badge>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {/* Languages Comparison */}
                <div className="grid gap-3 sm:grid-cols-2 p-3.5 rounded-xl border border-border/40 bg-accent/5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Current Languages</span>
                    <span className="font-semibold text-foreground leading-relaxed">{parseLanguages(req.currentLanguages)}</span>
                  </div>
                  <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-border/30 pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block flex items-center gap-1">
                      Requested Languages <ChevronRight className="h-3 w-3" />
                    </span>
                    <span className="font-bold text-teal-600 leading-relaxed">{parseLanguages(req.requestedLanguages)}</span>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1.5 p-3.5 rounded-xl border border-border/30 bg-background/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    Reason for Change
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-[11px] whitespace-pre-wrap">{req.reason}</p>
                </div>

                {/* Rejection Note */}
                {req.adminNote && (
                  <div className="space-y-1.5 p-3.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-rose-500" />
                      Rejection Reason (Admin Note)
                    </span>
                    <p className="leading-relaxed text-[11px]">{req.adminNote}</p>
                  </div>
                )}

                {/* Action buttons for pending */}
                {req.status === "pending" && (
                  <div className="flex justify-end gap-3 pt-2 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectingRequest(req)}
                      disabled={submittingAction}
                      className="rounded-xl border-rose-500/20 text-rose-600 hover:bg-rose-500/5 font-semibold text-2xs px-3.5"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Reject Request
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req)}
                      disabled={submittingAction}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-2xs px-3.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Approve & Update Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Note Modal Overlay */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">Reject Change Request</h3>
              <Button variant="ghost" size="sm" onClick={() => setRejectingRequest(null)} className="h-8 w-8 p-0 rounded-lg">
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 items-start p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <p>
                  You are rejecting the request from <strong>{rejectingRequest.translatorName}</strong>. Please provide a clear explanation for the rejection.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reason for Rejection</Label>
                <Textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="e.g. You have not uploaded verification documents for the new languages requested."
                  rows={4}
                  className="rounded-xl border-border/50 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
              <Button variant="outline" size="sm" onClick={() => setRejectingRequest(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleRejectSubmit}
                disabled={submittingAction}
                size="sm"
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {submittingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
