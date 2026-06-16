"use client";

import * as React from "react";
import { UserCheck, CheckCircle, XCircle, Loader2, FileText, Shield, User, Building2, ExternalLink, Eye, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getServices } from "@/services";
import type { VerificationRequest } from "@/types";

interface VerificationRequestWithProfile extends VerificationRequest {
  profile?: {
    fullName?: string;
    email?: string;
    companyName?: string;
    // Translator docs
    cvUrl?: string;
    idUrl?: string;
    certUrl?: string;
    // Company docs
    registrationDoc?: string;
    taxDoc?: string;
  }
}

export default function StaffVerificationsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<VerificationRequestWithProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = React.useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = React.useState<string>("");

  React.useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      const services = getServices();
      const all = await services.verification.getPendingRequests();
      
      const requestsWithProfiles: VerificationRequestWithProfile[] = await Promise.all(
        all.map(async (req) => {
          let profileData = null;
          try {
            if (req.role === "translator") {
              const p = await services.profile.getTranslatorProfile(req.userId);
              if (p) {
                let idUrl = "";
                let certUrl = "";
                if (p.certificates && p.certificates.length > 0) {
                  const idItem = p.certificates.find((c) => c.startsWith("id:"));
                  const certItem = p.certificates.find((c) => c.startsWith("cert:"));
                  idUrl = idItem ? idItem.replace("id:", "") : "";
                  certUrl = certItem ? certItem.replace("cert:", "") : (p.certificates[0] && !p.certificates[0].startsWith("id:") ? p.certificates[0] : "");
                }
                profileData = {
                  fullName: p.fullName,
                  email: p.email,
                  cvUrl: p.cvUrl,
                  idUrl,
                  certUrl,
                };
              }
            } else if (req.role === "company") {
              const p = await services.profile.getCompanyProfile(req.userId);
              if (p) {
                profileData = {
                  fullName: p.fullName,
                  companyName: p.companyName,
                  email: p.email,
                  registrationDoc: p.registrationDoc,
                  taxDoc: p.taxDoc,
                };
              }
            }
          } catch (err) {
            console.error("Failed to load profile for verification request:", err);
          }
          return {
            ...req,
            profile: profileData || undefined
          };
        })
      );
      
      setRequests(requestsWithProfiles);
    } catch {
      toast({ title: "Failed to load verification requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    setActionLoading(requestId);
    try {
      const services = getServices();
      await services.verification.approveRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.$id !== requestId));
      toast({ title: "Request approved successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(requestId: string) {
    const note = rejectNotes[requestId]?.trim();
    if (!note) {
      toast({ title: "Please provide a reason for rejection", variant: "destructive" });
      return;
    }
    setActionLoading(requestId);
    try {
      const services = getServices();
      await services.verification.rejectRequest(requestId, note);
      setRequests((prev) => prev.filter((r) => r.$id !== requestId));
      toast({ title: "Request rejected successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  const translatorsRequests = requests.filter(r => r.role === "translator");
  const companiesRequests = requests.filter(r => r.role === "company");

  const renderRequestCard = (req: VerificationRequestWithProfile) => {
    const prof = req.profile;
    return (
      <div key={req.$id} className="rounded-xl border border-border/60 p-5 bg-background/50 hover:bg-background/80 transition-all space-y-4">
        
        {/* User Info Group */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              {req.role === "translator" ? <User className="h-4 w-4 text-cyan-400" /> : <Building2 className="h-4 w-4 text-cyan-400" />}
              {prof?.fullName || "Loading Name..."} {prof?.companyName ? `(${prof.companyName})` : ""}
            </h3>
            <p className="text-xs text-muted-foreground">{prof?.email || req.userId}</p>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-md font-bold text-[10px] w-fit">
            Pending Review
          </Badge>
        </div>

        {/* Uploaded Documents Group */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Submitted Documents</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {req.role === "translator" ? (
              <>
                 {/* Translator ID */}
                <div className="p-3 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-2xs font-semibold block truncate">Personal ID / Passport</span>
                      <span className="text-[9px] text-muted-foreground block">Verification File</span>
                    </div>
                  </div>
                  {prof?.idUrl ? (
                    <div className="flex gap-1.5 items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(prof.idUrl!);
                          setPreviewTitle("Personal ID / Passport");
                        }}
                        className="p-1 hover:bg-muted text-cyan-400 rounded transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a href={prof.idUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-medium shrink-0">Not Provided</span>
                  )}
                </div>

                {/* Translator Certificate */}
                <div className="p-3 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-2xs font-semibold block truncate">Certificates</span>
                      <span className="text-[9px] text-muted-foreground block">Degrees/Accreditations</span>
                    </div>
                  </div>
                  {prof?.certUrl ? (
                    <div className="flex gap-1.5 items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(prof.certUrl!);
                          setPreviewTitle("Degrees/Accreditations Certificate");
                        }}
                        className="p-1 hover:bg-muted text-cyan-400 rounded transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a href={prof.certUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-medium shrink-0">Not Provided</span>
                  )}
                </div>

                {/* Translator CV */}
                <div className="p-3 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between gap-2 sm:col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-2xs font-semibold block truncate">CV / Resume</span>
                      <span className="text-[9px] text-muted-foreground block">Professional CV</span>
                    </div>
                  </div>
                  {prof?.cvUrl ? (
                    <div className="flex gap-1.5 items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(prof.cvUrl!);
                          setPreviewTitle("Linguist CV / Resume");
                        }}
                        className="p-1 hover:bg-muted text-cyan-400 rounded transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a href={prof.cvUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-medium shrink-0">Not Provided</span>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Company Registration license */}
                <div className="p-3 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-2xs font-semibold block truncate">Business Registration</span>
                      <span className="text-[9px] text-muted-foreground block">Official License</span>
                    </div>
                  </div>
                  {prof?.registrationDoc ? (
                    <div className="flex gap-1.5 items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(prof.registrationDoc!);
                          setPreviewTitle("Business Registration License");
                        }}
                        className="p-1 hover:bg-muted text-cyan-400 rounded transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a href={prof.registrationDoc} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-medium shrink-0">Not Provided</span>
                  )}
                </div>

                {/* Company Owner ID */}
                <div className="p-3 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-2xs font-semibold block truncate">Owner / Rep ID</span>
                      <span className="text-[9px] text-muted-foreground block">ID or Passport</span>
                    </div>
                  </div>
                  {prof?.taxDoc ? (
                    <div className="flex gap-1.5 items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(prof.taxDoc!);
                          setPreviewTitle("Representative Personal ID / Passport");
                        }}
                        className="p-1 hover:bg-muted text-cyan-400 rounded transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a href={prof.taxDoc} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground font-medium shrink-0">Not Provided</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Group */}
        <div className="space-y-2 pt-2">
          <Textarea
            placeholder="Provide a reason for rejection (required only if rejecting)..."
            value={rejectNotes[req.$id] || ""}
            onChange={(e) =>
              setRejectNotes((prev) => ({ ...prev, [req.$id]: e.target.value }))
            }
            className="min-h-[50px] text-2xs bg-background/50 border-border/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50 rounded-lg"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1.5 h-8 text-2xs rounded-lg px-3 bg-cyan-600 hover:bg-cyan-500 font-bold"
              onClick={() => handleApprove(req.$id)}
              disabled={actionLoading === req.$id}
            >
              {actionLoading === req.$id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              Approve & Verify
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5 h-8 text-2xs rounded-lg px-3 font-bold"
              onClick={() => handleReject(req.$id)}
              disabled={actionLoading === req.$id}
            >
              <XCircle className="h-3 w-3" />
              Reject Request
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Verification Requests
        </h1>
        <p className="text-muted-foreground text-sm">Review, inspect, and approve user verification documents.</p>
      </div>

      <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-semibold flex items-center gap-2">
            <UserCheck className="h-4.5 w-4.5 text-primary" />
            Pending Requests ({requests.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Toggle tabs below to manage translators and companies verification documents independently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No pending verification requests.
            </div>
          ) : (
            <Tabs defaultValue="translators" className="space-y-4">
              <TabsList className="grid grid-cols-2 max-w-[320px] rounded-lg bg-background/50 border border-border/50 p-1">
                <TabsTrigger value="translators" className="text-xs font-semibold rounded-md py-1.5">
                  Translators ({translatorsRequests.length})
                </TabsTrigger>
                <TabsTrigger value="companies" className="text-xs font-semibold rounded-md py-1.5">
                  Companies ({companiesRequests.length})
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[65vh] pr-2">
                <TabsContent value="translators" className="space-y-4 outline-none">
                  {translatorsRequests.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted-foreground">
                      No pending requests for translators.
                    </div>
                  ) : (
                    translatorsRequests.map(renderRequestCard)
                  )}
                </TabsContent>

                <TabsContent value="companies" className="space-y-4 outline-none">
                  {companiesRequests.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted-foreground">
                      No pending requests for companies.
                    </div>
                  ) : (
                    companiesRequests.map(renderRequestCard)
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[85vh] bg-card border border-border/50 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{previewTitle}</h3>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 text-2xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View File</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewTitle("");
                }}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 w-full h-full bg-black/10 rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0 absolute inset-0 z-10"
                title={previewTitle}
              />
              <div className="text-center p-6 space-y-3 z-0">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
                <p className="text-xs text-muted-foreground">If the document preview doesn't load, use the "View File" button above.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
