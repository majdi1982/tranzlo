"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, FileText, ArrowLeft, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getStorage, BUCKETS, ID } from "@/lib/appwrite";
import type { Dispute, Job } from "@/types";

export default function TranslatorDisputesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disputeId = searchParams.get("id");
  const { user } = useSession();
  const { toast } = useToast();

  const [dispute, setDispute] = React.useState<Dispute | null>(null);
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const [justification, setJustification] = React.useState("");
  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!disputeId) {
      setLoading(false);
      return;
    }

    async function loadDisputeData() {
      try {
        const services = getServices();
        const d = await services.dispute.getDispute(disputeId!);
        if (d) {
          setDispute(d);
          if (d.justifications) {
            setJustification(d.justifications);
          }
          const j = await services.job.getJob(d.jobId);
          setJob(j);
        }
      } catch (err) {
        console.error("Failed to load dispute:", err);
        toast({
          title: "Error Loading Dispute",
          description: "Failed to retrieve dispute details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadDisputeData();
  }, [disputeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setEvidenceFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeId) return;

    if (justification.trim().length < 20) {
      toast({
        title: "Justification too short",
        description: "Please explain your position in detail (minimum 20 characters).",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const services = getServices();
      const storage = getStorage();

      // Upload evidence files to Appwrite
      const fileUrls: string[] = [];
      for (const file of evidenceFiles) {
        const uploaded = await storage.createFile(BUCKETS.TRANSLATOR_DOCUMENTS, ID.unique(), file);
        const url = `${storage.client.config.endpoint}/storage/buckets/${BUCKETS.TRANSLATOR_DOCUMENTS}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;
        fileUrls.push(url);
      }

      // Merge with existing evidence files if any
      const allEvidence = [...(dispute?.evidenceFiles || []), ...fileUrls];

      // Submit evidence and justifications
      await services.dispute.submitEvidence(disputeId, justification.trim(), allEvidence);

      toast({
        title: "Evidence Submitted Successfully",
        description: "Your counter-argument and evidence have been sent to support for review.",
        variant: "success",
      });

      router.push("/dashboard/translator/applications");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Submission Failed",
        description: err.message || "An error occurred while submitting evidence.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!disputeId || !dispute) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-border/50 bg-card">
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold">Dispute Not Found</h3>
          <p className="text-xs text-muted-foreground">The dispute ID you requested is invalid or does not exist.</p>
          <Link href="/dashboard/translator/applications">
            <Button className="w-full">Back to Applications</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["translator"]}>
        <div className="max-w-2xl mx-auto space-y-6 animate-in">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/translator/applications">
              <Button variant="ghost" size="icon" className="rounded-xl border border-border/40">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dispute Resolution</h1>
              <p className="text-xs text-muted-foreground">Submit justifications and evidence for active disputes</p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Dispute Details Card */}
            <Card className="border-border/50 bg-card rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-background/30 to-accent/5 pb-4 border-b border-border/20">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-600 dark:text-rose-500">
                  <ShieldAlert className="h-5 w-5" />
                  <span>Active Dispute Details</span>
                </CardTitle>
                <CardDescription className="text-2xs">
                  Review the client's reason for raising this dispute
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {job && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Project Title</span>
                    <span className="text-sm font-semibold text-foreground">{job.title}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Client's Dispute Reason</span>
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs text-foreground/90 mt-1 whitespace-pre-wrap leading-relaxed">
                    {dispute.reason}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Status</span>
                  <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2.5 py-0.5 text-2xs font-semibold text-amber-600 dark:text-amber-400 capitalize mt-1 border border-amber-500/20">
                    {dispute.status}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Counter-Argument & Evidence Form */}
            <Card className="border-border/50 bg-card rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Submit Evidence</CardTitle>
                <CardDescription className="text-2xs">
                  Explain your position and upload files (translations, screenshots, instructions) to defend your work
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="justification" className="text-xs font-bold text-foreground">
                      Your Position/Justification (Required)
                    </Label>
                    <Textarea
                      id="justification"
                      placeholder="Provide a detailed explanation of why the work delivered is correct or matches instructions..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      className="min-h-[150px] text-xs rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground block">
                      Evidence Documents (Optional)
                    </Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-xl cursor-pointer bg-background hover:bg-accent/5 hover:border-primary/30 transition-all"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-1 text-xs text-muted-foreground">
                            <span className="font-bold text-primary">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-4xs text-muted-foreground/60">PDF, JPG, PNG or DOCX (Max 10MB)</p>
                        </div>
                        <input
                          id="dropzone-file"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Uploaded Evidence Files List */}
                    {evidenceFiles.length > 0 && (
                      <div className="space-y-1.5 mt-3">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">New Uploads</span>
                        <div className="space-y-1.5">
                          {evidenceFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border border-border/30 rounded-xl bg-background text-2xs">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="h-4 w-4 text-cyan-500 shrink-0" />
                                <span className="font-semibold truncate">{file.name}</span>
                                <span className="text-3xs text-muted-foreground shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(idx)}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded-lg text-3xs font-semibold"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Previously Uploaded Evidence Files */}
                    {dispute.evidenceFiles && dispute.evidenceFiles.length > 0 && (
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-border/20">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Submitted Evidence</span>
                        <div className="flex flex-wrap gap-2">
                          {dispute.evidenceFiles.map((fileUrl, idx) => (
                            <a
                              key={idx}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 bg-accent/10 hover:bg-accent/20 transition-all text-2xs font-semibold"
                            >
                              <FileText className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Evidence Document #{idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-5 bg-muted/20 border-t border-border/10 flex justify-end gap-3 rounded-b-2xl">
                  <Link href="/dashboard/translator/applications">
                    <Button type="button" variant="outline" className="text-xs font-semibold rounded-xl">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="text-xs font-semibold rounded-xl"
                    disabled={justification.trim().length < 20 || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Evidence"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
