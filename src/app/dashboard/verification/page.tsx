"use client";

import * as React from "react";
import { 
  Shield, ShieldAlert, ShieldCheck, ShieldAlert as ShieldX, Loader2, ArrowRight,
  FileText, CheckCircle2, AlertCircle, ExternalLink, Sparkles, Star, DollarSign, Upload, Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { getStorage, ID, BUCKETS } from "@/lib/appwrite";
import { getLanguageName } from "@/data/languages";
import Link from "next/link";

interface LanguageCert {
  pairId: string;
  pairLabel: string;
  certUrl: string;
}

export default function VerificationPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<"unverified" | "pending" | "verified" | "rejected">("unverified");
  const [adminNote, setAdminNote] = React.useState("");
  
  // Document states
  const [nationalIdUrl, setNationalIdUrl] = React.useState("");
  const [languageCerts, setLanguageCerts] = React.useState<LanguageCert[]>([]);
  const [activePairs, setActivePairs] = React.useState<string[]>([]);
  
  const [registrationDoc, setRegistrationDoc] = React.useState("");
  const [taxDoc, setTaxDoc] = React.useState("");
  const [founderIdUrl, setFounderIdUrl] = React.useState("");

  // Uploading states
  const [uploadingField, setUploadingField] = React.useState<string | null>(null);

  const fileInputRefs = {
    nationalId: React.useRef<HTMLInputElement>(null),
    registrationDoc: React.useRef<HTMLInputElement>(null),
    taxDoc: React.useRef<HTMLInputElement>(null),
    founderId: React.useRef<HTMLInputElement>(null),
  };

  const role = (user?.prefs?.role as string) || "translator";

  React.useEffect(() => {
    async function loadStatus() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        if (role === "translator") {
          const profile = await services.profile.getTranslatorProfile(user.$id);
          if (profile) {
            setStatus((profile.verificationStatus as any) || "unverified");
            setNationalIdUrl(profile.nationalIdUrl || "");
            
            // Parse languageCertificates
            let certs: LanguageCert[] = [];
            if (profile.languageCertificates) {
              try {
                certs = JSON.parse(profile.languageCertificates);
              } catch (e) {
                console.error("Failed to parse language certificates", e);
              }
            }
            setLanguageCerts(certs);

            // Parse languagePairs to get activePairs
            let parsedPairs: string[] = [];
            if (profile.languagePairs) {
              try {
                const pairs = typeof profile.languagePairs === "string"
                  ? JSON.parse(profile.languagePairs)
                  : profile.languagePairs;
                if (Array.isArray(pairs)) {
                  parsedPairs = pairs.map((p: any) => `${p.source}-${p.target}`);
                }
              } catch (e) {
                console.error("Failed to parse language pairs", e);
              }
            }
            setActivePairs(parsedPairs);
          }
        } else {
          const profile = await services.profile.getCompanyProfile(user.$id);
          if (profile) {
            setStatus((profile.verificationStatus as any) || "unverified");
            setRegistrationDoc(profile.registrationDoc || "");
            setTaxDoc(profile.taxDoc || "");
            setFounderIdUrl(profile.founderIdUrl || "");
          }
        }
      } catch (err) {
        toast({ title: "Failed to load verification status", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, [user?.$id, role, toast]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: string, pairId?: string) {
    const file = e.target.files?.[0];
    if (!file || !user?.$id) return;

    const uploadKey = pairId ? `${fieldName}-${pairId}` : fieldName;
    setUploadingField(uploadKey);

    try {
      const storage = getStorage();
      let bucketId: string = BUCKETS.TRANSLATOR_DOCUMENTS;
      if (role === "company") {
        bucketId = BUCKETS.COMPANY_DOCUMENTS;
      } else if (fieldName === "nationalId" || fieldName === "cert") {
        bucketId = BUCKETS.CERTIFICATES;
      }

      const uploaded = await storage.createFile(bucketId, ID.unique(), file);
      const fileUrl = storage.getFileView(bucketId, uploaded.$id).toString();

      const services = getServices();

      if (role === "translator") {
        if (fieldName === "nationalId") {
          setNationalIdUrl(fileUrl);
          await services.profile.updateTranslatorProfile(user.$id, { nationalIdUrl: fileUrl });
          toast({ title: "Identity document uploaded and saved", variant: "success" });
        } else if (fieldName === "cert" && pairId) {
          const [src, tgt] = pairId.split("-");
          const pairLabel = `${getLanguageName(src)} ➔ ${getLanguageName(tgt)}`;
          
          // Update list
          const updatedCerts = [...languageCerts.filter(c => c.pairId !== pairId), {
            pairId,
            pairLabel,
            certUrl: fileUrl
          }];
          setLanguageCerts(updatedCerts);
          await services.profile.updateTranslatorProfile(user.$id, {
            languageCertificates: JSON.stringify(updatedCerts)
          });
          toast({ title: `Certificate for ${pairLabel} uploaded`, variant: "success" });
        }
      } else {
        const updateData: any = {};
        if (fieldName === "registrationDoc") {
          setRegistrationDoc(fileUrl);
          updateData.registrationDoc = fileUrl;
        } else if (fieldName === "taxDoc") {
          setTaxDoc(fileUrl);
          updateData.taxDoc = fileUrl;
        } else if (fieldName === "founderIdUrl") {
          setFounderIdUrl(fileUrl);
          updateData.founderIdUrl = fileUrl;
        }
        await services.profile.updateCompanyProfile(user.$id, updateData);
        toast({ title: "Document uploaded and saved", variant: "success" });
      }
    } catch (err) {
      toast({ title: "Failed to upload document", variant: "destructive" });
    } finally {
      setUploadingField(null);
      // Reset input value
      e.target.value = "";
    }
  }

  async function handleRemoveFile(fieldName: string, pairId?: string) {
    if (!user?.$id) return;
    try {
      const services = getServices();
      if (role === "translator") {
        if (fieldName === "nationalId") {
          setNationalIdUrl("");
          await services.profile.updateTranslatorProfile(user.$id, { nationalIdUrl: "" });
          toast({ title: "Identity document removed", variant: "success" });
        } else if (fieldName === "cert" && pairId) {
          const updatedCerts = languageCerts.filter(c => c.pairId !== pairId);
          setLanguageCerts(updatedCerts);
          await services.profile.updateTranslatorProfile(user.$id, {
            languageCertificates: JSON.stringify(updatedCerts)
          });
          toast({ title: "Certificate removed", variant: "success" });
        }
      } else {
        const updateData: any = {};
        if (fieldName === "registrationDoc") {
          setRegistrationDoc("");
          updateData.registrationDoc = "";
        } else if (fieldName === "taxDoc") {
          setTaxDoc("");
          updateData.taxDoc = "";
        } else if (fieldName === "founderIdUrl") {
          setFounderIdUrl("");
          updateData.founderIdUrl = "";
        }
        await services.profile.updateCompanyProfile(user.$id, updateData);
        toast({ title: "Document removed", variant: "success" });
      }
    } catch {
      toast({ title: "Failed to remove document", variant: "destructive" });
    }
  }

  async function handleSubmitRequest() {
    if (!user?.$id) return;
    setSubmitting(true);
    try {
      const services = getServices();
      await services.verification.submitRequest(user.$id, role);
      setStatus("pending");
      toast({ title: "Verification request submitted successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to submit verification request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Verification requirements validation logic
  const isReady = React.useMemo(() => {
    if (role === "translator") {
      // Must upload National ID
      if (!nationalIdUrl) return false;
      // Must have at least 1 language pair
      if (activePairs.length === 0) return false;
      // Must have certificates for all active language pairs
      return activePairs.every(pairId => languageCerts.some(c => c.pairId === pairId && c.certUrl));
    } else {
      // Must upload all company documents
      return !!registrationDoc && !!taxDoc && !!founderIdUrl;
    }
  }, [role, nationalIdUrl, activePairs, languageCerts, registrationDoc, taxDoc, founderIdUrl]);

  const renderStatusDetails = () => {
    switch (status) {
      case "verified":
        return {
          icon: <ShieldCheck className="h-16 w-16 text-emerald-500 animate-pulse" />,
          title: "Account Verified Successfully",
          description: "Your profile has been fully vetted by our safety team. You now have a verified badge and priority indexing on search pages.",
          badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        };
      case "pending":
        return {
          icon: <Shield className="h-16 w-16 text-amber-500 animate-pulse" />,
          title: "Verification Request Pending",
          description: "Your verification request is currently under review by our administration. We will update your status shortly.",
          badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
      case "rejected":
        return {
          icon: <ShieldX className="h-16 w-16 text-rose-500" />,
          title: "Verification Request Rejected",
          description: "Unfortunately, your verification request was not approved. You can review the admin notes below and re-submit when ready.",
          badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        };
      default:
        return {
          icon: <ShieldAlert className="h-16 w-16 text-slate-500" />,
          title: "Account Unverified",
          description: "Submit a request to verify your identity/company legitimacy and unlock the verified badge across the platform.",
          badgeColor: "bg-slate-500/10 text-slate-400 border-slate-800",
        };
    }
  };

  const details = renderStatusDetails();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto space-y-6 pt-8 pb-16 px-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground/95">Identity Verification</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account credibility and upload verification documents
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Status & Uploads Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="glass-card p-8 border-border/40 rounded-2xl flex flex-col items-center text-center space-y-6 bg-gradient-to-br from-background/30 to-accent/5">
              <div className="flex justify-center p-4 rounded-3xl bg-accent/10">
                {details.icon}
              </div>

              <div className="space-y-2 max-w-md">
                <div className="flex justify-center mb-1">
                  <Badge variant="outline" className={`capitalize font-semibold rounded-lg ${details.badgeColor}`}>
                    {status}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold tracking-tight">{details.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {details.description}
                </p>
              </div>

              {status === "unverified" && (
                <div className="space-y-4 w-full max-w-md">
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={submitting || !isReady}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium gap-2 shadow-md transition-all duration-300 py-6 text-sm"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Submit Verification Request <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {!isReady && (
                    <p className="text-xs text-amber-500 font-medium bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                      ⚠️ Please upload all required documents below to submit your verification request.
                    </p>
                  )}
                </div>
              )}

              {status === "rejected" && (
                <div className="w-full max-w-md p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-200 text-xs text-left space-y-2">
                  <h4 className="font-bold">Rejection Feedback:</h4>
                  <p className="italic text-rose-300">
                    {adminNote || "Please ensure your details and files are correct and valid before re-submitting."}
                  </p>
                  <div className="pt-2 flex justify-end gap-2 items-center">
                    {!isReady && (
                      <span className="text-[10px] text-amber-500/80 mr-auto">
                        ⚠️ missing documents
                      </span>
                    )}
                    <Button
                      onClick={handleSubmitRequest}
                      disabled={submitting || !isReady}
                      size="sm"
                      className="rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 text-white"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-Submit Request"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Document Uploader Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground/95">Verification Documents</h3>

              {role === "translator" ? (
                <>
                  {/* Translator National ID */}
                  <Card className="glass-card border-border/40 rounded-xl p-5 bg-gradient-to-b from-background/40 to-background/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <FileText className={`h-6 w-6 mt-0.5 ${nationalIdUrl ? "text-teal-500" : "text-muted-foreground"}`} />
                        <div>
                          <h4 className="text-sm font-bold text-foreground">National ID / Proof of Identity</h4>
                          <p className="text-xs text-muted-foreground">Upload a scan of your National ID, Passport, or Residence Permit</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {nationalIdUrl ? (
                          <>
                            <a href={nationalIdUrl} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
                                View <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemoveFile("nationalId")}
                              className="rounded-lg p-2"
                              disabled={status === "pending" || status === "verified"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              onChange={(e) => handleFileUpload(e, "nationalId")}
                              className="hidden" 
                              ref={fileInputRefs.nationalId}
                              id="nationalId-upload"
                            />
                            <Button 
                              onClick={() => fileInputRefs.nationalId.current?.click()}
                              disabled={uploadingField === "nationalId" || status === "pending" || status === "verified"}
                              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs gap-1.5"
                            >
                              {uploadingField === "nationalId" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Translator Language Certificates */}
                  <Card className="glass-card border-border/40 rounded-xl p-5 bg-gradient-to-b from-background/40 to-background/10 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Language Pair Certificates</h4>
                      <p className="text-xs text-muted-foreground">Provide certificates or credentials for each language pair added to your profile</p>
                    </div>

                    {activePairs.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-border/40 rounded-xl bg-accent/5">
                        <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                        <p className="text-xs text-muted-foreground mb-3">No active language pairs found in your profile.</p>
                        <Link href="/profile?edit=true">
                          <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1.5">
                            Add Language Pairs <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/40">
                        {activePairs.map((pairId) => {
                          const [src, tgt] = pairId.split("-");
                          const label = `${getLanguageName(src)} ➔ ${getLanguageName(tgt)}`;
                          const cert = languageCerts.find(c => c.pairId === pairId);
                          const fileRef = React.createRef<HTMLInputElement>();
                          const uploadKey = `cert-${pairId}`;

                          return (
                            <div key={pairId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                              <div className="flex items-start gap-3">
                                <FileText className={`h-5 w-5 mt-0.5 ${cert?.certUrl ? "text-teal-500" : "text-muted-foreground"}`} />
                                <div className="space-y-0.5">
                                  <h5 className="text-xs font-bold text-foreground">{label}</h5>
                                  <p className="text-3xs text-muted-foreground">Certificate proving proficiency for this language pair</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {cert?.certUrl ? (
                                  <>
                                    <a href={cert.certUrl} target="_blank" rel="noreferrer">
                                      <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
                                        View <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </a>
                                    <Button 
                                      variant="destructive" 
                                      size="sm" 
                                      onClick={() => handleRemoveFile("cert", pairId)}
                                      className="rounded-lg p-2"
                                      disabled={status === "pending" || status === "verified"}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <div className="relative">
                                    <input 
                                      type="file" 
                                      accept="image/*,.pdf" 
                                      onChange={(e) => handleFileUpload(e, "cert", pairId)}
                                      className="hidden" 
                                      ref={fileRef}
                                      id={`cert-upload-${pairId}`}
                                    />
                                    <Button 
                                      onClick={() => fileRef.current?.click()}
                                      disabled={uploadingField === uploadKey || status === "pending" || status === "verified"}
                                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs gap-1.5"
                                    >
                                      {uploadingField === uploadKey ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Upload className="h-3.5 w-3.5" />
                                      )}
                                      Upload Certificate
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </>
              ) : (
                <>
                  {/* Company Commercial Registration */}
                  <Card className="glass-card border-border/40 rounded-xl p-5 bg-gradient-to-b from-background/40 to-background/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <FileText className={`h-6 w-6 mt-0.5 ${registrationDoc ? "text-teal-500" : "text-muted-foreground"}`} />
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Commercial Registration</h4>
                          <p className="text-xs text-muted-foreground">Upload the official commercial registration doc (CR / Trade License)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {registrationDoc ? (
                          <>
                            <a href={registrationDoc} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
                                View <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemoveFile("registrationDoc")}
                              className="rounded-lg p-2"
                              disabled={status === "pending" || status === "verified"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              onChange={(e) => handleFileUpload(e, "registrationDoc")}
                              className="hidden" 
                              ref={fileInputRefs.registrationDoc}
                              id="registrationDoc-upload"
                            />
                            <Button 
                              onClick={() => fileInputRefs.registrationDoc.current?.click()}
                              disabled={uploadingField === "registrationDoc" || status === "pending" || status === "verified"}
                              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs gap-1.5"
                            >
                              {uploadingField === "registrationDoc" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Company Tax Certificate */}
                  <Card className="glass-card border-border/40 rounded-xl p-5 bg-gradient-to-b from-background/40 to-background/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <FileText className={`h-6 w-6 mt-0.5 ${taxDoc ? "text-teal-500" : "text-muted-foreground"}`} />
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Tax Certificate</h4>
                          <p className="text-xs text-muted-foreground">Upload the VAT or Tax registration certificate of the company</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {taxDoc ? (
                          <>
                            <a href={taxDoc} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
                                View <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemoveFile("taxDoc")}
                              className="rounded-lg p-2"
                              disabled={status === "pending" || status === "verified"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              onChange={(e) => handleFileUpload(e, "taxDoc")}
                              className="hidden" 
                              ref={fileInputRefs.taxDoc}
                              id="taxDoc-upload"
                            />
                            <Button 
                              onClick={() => fileInputRefs.taxDoc.current?.click()}
                              disabled={uploadingField === "taxDoc" || status === "pending" || status === "verified"}
                              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs gap-1.5"
                            >
                              {uploadingField === "taxDoc" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Founder ID */}
                  <Card className="glass-card border-border/40 rounded-xl p-5 bg-gradient-to-b from-background/40 to-background/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <FileText className={`h-6 w-6 mt-0.5 ${founderIdUrl ? "text-teal-500" : "text-muted-foreground"}`} />
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Founder / Authorized Signatory ID</h4>
                          <p className="text-xs text-muted-foreground">Upload the passport or national ID of the founder or owner</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {founderIdUrl ? (
                          <>
                            <a href={founderIdUrl} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1">
                                View <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemoveFile("founderIdUrl")}
                              className="rounded-lg p-2"
                              disabled={status === "pending" || status === "verified"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              onChange={(e) => handleFileUpload(e, "founderIdUrl")}
                              className="hidden" 
                              ref={fileInputRefs.founderId}
                              id="founderIdUrl-upload"
                            />
                            <Button 
                              onClick={() => fileInputRefs.founderId.current?.click()}
                              disabled={uploadingField === "founderIdUrl" || status === "pending" || status === "verified"}
                              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs gap-1.5"
                            >
                              {uploadingField === "founderIdUrl" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Benefits & Support */}
          <div className="space-y-6">
            {/* Verification Status Summary */}
            <Card className="glass-card border-border/40 rounded-2xl p-6 bg-gradient-to-b from-background/40 to-background/10">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-bold text-foreground">Verification Check</CardTitle>
                <CardDescription className="text-xs">Document upload checklist status</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {role === "translator" ? (
                  <>
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-accent/5">
                      <span className="text-xs text-foreground font-medium">National ID Uploaded</span>
                      {nationalIdUrl ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-accent/5">
                      <span className="text-xs text-foreground font-medium">Language Certificates Uploaded</span>
                      {activePairs.length > 0 && activePairs.every(pairId => languageCerts.some(c => c.pairId === pairId && c.certUrl)) ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-accent/5">
                      <span className="text-xs text-foreground font-medium">Commercial Registration</span>
                      {registrationDoc ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-accent/5">
                      <span className="text-xs text-foreground font-medium">Tax Certificate</span>
                      {taxDoc ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-accent/5">
                      <span className="text-xs text-foreground font-medium">Founder ID Document</span>
                      {founderIdUrl ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card className="glass-card border-border/40 rounded-2xl p-6 bg-gradient-to-b from-teal-500/5 to-accent/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Why Get Verified?
                </CardTitle>
                <CardDescription className="text-xs">Unlock exclusive benefits across the platform</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 shrink-0 mt-0.5">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-foreground">Trust Badge Accreditation</h5>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Earn a verified safety checkmark to show recruiters your corporate or professional credentials are legit.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 shrink-0 mt-0.5">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-foreground">Priority Directory Indexing</h5>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Verified linguists rank higher in searches, filtering queries, and recommendations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 shrink-0 mt-0.5">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-foreground">Direct Escrow Payments</h5>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Unlock instant payouts and priority balance releases to your PayPal payout addresses.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
