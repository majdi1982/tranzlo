"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Clock, DollarSign, Globe, Loader2, MapPin, Send, Star, TestTube, Upload, ExternalLink, FileText } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LANGUAGES, getLanguageName } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";
import { SERVICE_TYPES } from "@/data/service-types";
import type { Job, Application, CompanyProfile, TranslatorProfile } from "@/types";
import { getStorage, ID, BUCKETS } from "@/lib/appwrite";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSession();
  const { toast } = useToast();
  const [job, setJob] = React.useState<Job | null>(null);
  const [company, setCompany] = React.useState<CompanyProfile | null>(null);
  const [translatorProfile, setTranslatorProfile] = React.useState<TranslatorProfile | null>(null);
  const [application, setApplication] = React.useState<Application | null>(null);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [bidAmount, setBidAmount] = React.useState("");
  const [selectedPair, setSelectedPair] = React.useState("");
  const [testSolutionUrl, setTestSolutionUrl] = React.useState("");
  const [testSolutionUploading, setTestSolutionUploading] = React.useState(false);
  const [testSubmitting, setTestSubmitting] = React.useState(false);
  const testSolutionFileInputRef = React.useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [appsCount, setAppsCount] = React.useState(0);
  const [isInvited, setIsInvited] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const isOwner = user && job?.companyId === user.$id;

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const jobData = await services.job.getJob(params.id as string);
        if (!jobData) return;
        setJob(jobData);
        setBidAmount(String(jobData.budgetMax || jobData.budget));

        const targetLangs = jobData.targetLanguage ? jobData.targetLanguage.split(",").map((t) => t.trim()) : [];
        const sourceLangs = jobData.sourceLanguage ? jobData.sourceLanguage.split(",").map((s) => s.trim()) : [];
        if (sourceLangs.length > 0 && targetLangs.length > 0) {
          setSelectedPair(`${sourceLangs[0]}-${targetLangs[0]}`);
        }

        const [companyData, myApps, jobApps] = await Promise.all([
          services.profile.getCompanyProfile(jobData.companyId),
          user ? services.application.getMyApplications(user.$id) : Promise.resolve([]),
          services.application.getApplications(jobData.$id),
        ]);
        setCompany(companyData);
        setAppsCount(jobApps.length);
        const existing = myApps.find((a) => a.jobId === jobData.$id);
        if (existing) setApplication(existing);

        if (user && user.prefs?.role === "translator") {
          const profileData = await services.profile.getTranslatorProfile(user.$id);
          setTranslatorProfile(profileData);
          const invitedList = jobData.invitedTranslators || [];
          setIsInvited(invitedList.includes(user.$id));
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, user?.$id]);

  async function handleTestSolutionUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestSolutionUploading(true);
    try {
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.TRANSLATOR_DOCUMENTS, ID.unique(), file);
      const fileUrl = storage.getFileView(BUCKETS.TRANSLATOR_DOCUMENTS, uploaded.$id).toString();
      setTestSolutionUrl(fileUrl);
      toast({ title: "Test solution uploaded successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to upload test solution", variant: "destructive" });
    } finally {
      setTestSolutionUploading(false);
      if (testSolutionFileInputRef.current) testSolutionFileInputRef.current.value = "";
    }
  }

  async function handleApply() {
    if (!user || !job) return;
    // Validate bid amount range
    const min = job.budgetMin || 0;
    const max = job.budgetMax || job.budget;
    const bidVal = bidAmount ? Number(bidAmount) : 0;
    if (bidVal < min || bidVal > max) {
      toast({ title: `Your bid must be between $${min} and $${max} USD.`, variant: "destructive" });
      return;
    }

    if (!selectedPair) {
      toast({ title: "Please select a language pair.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const services = getServices();
      const [src, tgt] = selectedPair.split("-");
      const friendlyPair = `${src.toUpperCase()} → ${tgt.toUpperCase()}`;

      await services.application.apply({
        jobId: job!.$id,
        coverLetter,
        translatorId: user.$id,
        bidAmount: bidVal,
        languagePair: friendlyPair,
      } as any);
      toast({ title: "Application submitted!", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Failed to apply", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Briefcase className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Job not found</h2>
        <p className="text-muted-foreground">This job posting may have been removed or is no longer available.</p>
        <Button variant="outline" onClick={() => router.push("/jobs")}>Browse Jobs</Button>
      </div>
    );
  }

  // Profile matching validation
  const isTranslator = user && user.prefs?.role === "translator";
  const jobSourceLangs = job.sourceLanguage ? job.sourceLanguage.split(",").map((s) => s.trim()) : [];
  const jobTargetLangs = job.targetLanguage ? job.targetLanguage.split(",").map((t) => t.trim()) : [];
  const transLangs = translatorProfile?.languages || [];
  
  const hasMatchingSource = !isTranslator || transLangs.some((l) => jobSourceLangs.includes(l));
  const hasMatchingTarget = !isTranslator || transLangs.some((l) => jobTargetLangs.includes(l));
  const hasMatchingLangs = hasMatchingSource && hasMatchingTarget;

  const jobSpecs = job.specializations || [];
  const transSpecs = translatorProfile?.specializations || [];
  const hasMatchingSpecs = !isTranslator || jobSpecs.length === 0 || transSpecs.some((s) => jobSpecs.includes(s));

  const isProfileMatch = !isTranslator || (hasMatchingLangs && hasMatchingSpecs);

  // JobPosting JSON-LD Schema
  const jobJsonLd = job ? {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.createdAt,
    "validThrough": job.deadline,
    "employmentType": "CONTRACTOR",
    "hiringOrganization": {
      "@type": "Organization",
      "name": company?.companyName || "Client on Tranzlo",
      ...(company?.website && { "sameAs": company.website }),
      ...(company?.logoUrl && { "logo": company.logoUrl })
    },
    "jobLocationType": job.workType === "online" ? "TELECOMMUTE" : "PHYSICAL",
    ...(job.workType !== "online" && job.country && {
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": job.country
        }
      }
    }),
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.budget,
        "minValue": job.budgetMin || job.budget,
        "maxValue": job.budgetMax || job.budget,
        "unitText": "HOUR"
      }
    }
  } : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {jobJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
        />
      )}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-lg text-muted-foreground mt-1">
                <Globe className="inline h-4 w-4 mr-1" />
                {getLanguageName(job.sourceLanguage)} → {getLanguageName(job.targetLanguage)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-primary">
                ${(job.budgetMin || job.budget).toLocaleString()} - ${(job.budgetMax || job.budget).toLocaleString()}
              </p>
              <span className="text-xs text-muted-foreground font-semibold uppercase">Budget Range</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.workType === "online" ? "Remote" : job.country ?? "On-site"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Posted: {new Date(job.createdAt).toLocaleDateString()}
            </span>
            {job.requiresTest && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <TestTube className="h-3 w-3" /> Test Required
              </Badge>
            )}
            {isInvited && (
              <Badge variant="default" className="flex items-center gap-1 bg-teal-600">
                <CheckCircle2 className="h-3 w-3" /> Invited
              </Badge>
            )}
            {job.maxApplicants && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {appsCount}/{job.maxApplicants} applicants
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.specializations?.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                try {
                  const svcs = JSON.parse(job.services);
                  return Array.isArray(svcs) ? svcs.map((s: { serviceId: string; quantity: number; unit?: string }, i: number) => {
                    const st = SERVICE_TYPES.find((t) => t.id === s.serviceId);
                    return (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <span>{st?.name ?? s.serviceId}</span>
                        <span className="text-muted-foreground">{s.quantity.toLocaleString()} {s.unit ?? "unit"}</span>
                      </div>
                    );
                  }) : null;
                } catch { return null; }
              })()}
            </div>
          </CardContent>
        </Card>

        {job.requiredCatTools && job.requiredCatTools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Required CAT Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.requiredCatTools.map((tool) => (
                  <Badge key={tool} variant="outline">{tool}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Reviewer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {job.reviewerType === "company"
                ? "The company will assign a reviewer to check the translation quality."
                : "We provides reviewer (AI Reviewer) to check the translation quality automatically."}
            </p>
          </CardContent>
        </Card>

        {company && (
          <Card>
            <CardHeader>
              <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{company.companyName}</p>
              {company.about && <p className="text-sm text-muted-foreground mt-1">{company.about}</p>}
            </CardContent>
          </Card>
        )}

        {user && !isOwner && job.status === "open" && !application && (
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Job</CardTitle>
              <CardDescription>Submit your application with your proposed budget and a cover letter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isProfileMatch && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-destructive">Profile Verification Failed</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    You cannot apply for this job because your profile does not meet the specified job requirements. Please align your translator profile criteria:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-xs text-muted-foreground">
                    {!hasMatchingSource && (
                      <li>
                        Required Source Languages:{" "}
                        <span className="font-semibold text-foreground">
                          {jobSourceLangs.map((l) => getLanguageName(l)).join(", ")}
                        </span>
                      </li>
                    )}
                    {!hasMatchingTarget && (
                      <li>
                        Required Target Languages:{" "}
                        <span className="font-semibold text-foreground">
                          {jobTargetLangs.map((l) => getLanguageName(l)).join(", ")}
                        </span>
                      </li>
                    )}
                    {!hasMatchingSpecs && (
                      <li>
                        Required Specializations:{" "}
                        <span className="font-semibold text-foreground">
                          {jobSpecs.join(", ")}
                        </span>
                      </li>
                    )}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-fit bg-background text-foreground border-destructive/30 hover:bg-destructive/10"
                    onClick={() => router.push("/profile")}
                  >
                    Configure My Profile
                  </Button>
                </div>
              )}

              {/* Language Pair Selector — only profile-matching pairs */}
              {isTranslator && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Language Pair</label>
                  <p className="text-xs text-muted-foreground">Choose the language pair you will translate. Only pairs matching your profile languages are shown.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const list: any[] = [];
                      jobSourceLangs.forEach(src => {
                        jobTargetLangs.forEach(tgt => {
                          const matchesProfile = transLangs.includes(src) && transLangs.includes(tgt);
                          if (!matchesProfile) return;
                          list.push({ id: `${src}-${tgt}`, src, tgt });
                        });
                      });
                      if (list.length === 0) {
                        return (
                          <div className="col-span-full p-4 text-center text-sm text-muted-foreground border border-dashed border-border/50 rounded-xl">
                            No matching language pairs found. Update your profile languages to match this job.
                          </div>
                        );
                      }
                      return list.map((p) => {
                        const isSelected = selectedPair === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPair(p.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden select-none flex items-center justify-between ${
                              isSelected
                                ? "border-teal-500 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                                : "border-teal-500/30 bg-teal-500/5 hover:border-teal-500/60"
                            }`}
                          >
                            <span className="text-sm font-bold text-foreground">
                              {getLanguageName(p.src)} → {getLanguageName(p.tgt)}
                            </span>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-teal-500 bg-teal-500 text-white" : "border-teal-400/50"}`}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Proposed Bid Price (USD)</label>
                <Input
                  type="number"
                  placeholder="e.g. 80"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={!isProfileMatch}
                  className="h-11 rounded-xl bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  You must propose a bid amount within the client's budget range:{" "}
                  <span className="font-semibold text-foreground">
                    ${job.budgetMin || 0} - ${job.budgetMax || job.budget} USD
                  </span>.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Letter</label>
                <Textarea
                  placeholder="Introduce yourself and explain why you are the right translator for this project..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  disabled={!isProfileMatch}
                  className="min-h-[140px]"
                />
              </div>
              <Button onClick={handleApply} disabled={submitting || coverLetter.length < 20 || !bidAmount || !isProfileMatch}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Application
              </Button>
            </CardContent>
          </Card>
        )}

        {application && (
          <Card>
            <CardHeader>
              <CardTitle>Your Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  You applied on {new Date(application.createdAt).toLocaleDateString()}
                  {application.status !== "submitted" && (
                    <> · Status: <Badge variant={
                      application.status === "accepted" ? "default" :
                      application.status === "rejected" ? "destructive" : "secondary"
                    }>{application.status}</Badge></>
                  )}
                </span>
              </div>
              {application.bidAmount && (
                <div className="text-sm text-muted-foreground mt-2">
                  Proposed Bid Price: <span className="font-semibold text-foreground">${application.bidAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Test section — visible when shortlisted and job requires test */}
              {job.requiresTest && application.status === "shortlisted" && (
                <div className="relative overflow-hidden flex flex-col gap-3 p-5 rounded-xl bg-gradient-to-br from-teal-600/10 via-teal-500/5 to-emerald-600/10 border border-teal-500/20 text-sm shadow-[0_0_30px_rgba(20,184,166,0.08)] mt-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                      <TestTube className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-teal-600 block text-sm">Translation Test — Show Your Skills</span>
                      <span className="text-xs text-muted-foreground">The company has invited you to complete a test. Submit your translation below.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-white/40 dark:bg-white/5 border border-teal-500/10 relative z-10">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Max word count</span>
                      <span className="font-semibold text-teal-600">{job.testWordCount || 250} words</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Allowed Time</span>
                      <span className="font-semibold text-teal-600">{job.testDuration || 24} hours</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 relative z-10">
                    {job.testFileUrl && (
                      <a
                        href={job.testFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-500 hover:to-emerald-500 transition-all shadow-md shadow-teal-600/20"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Download Test File</span>
                      </a>
                    )}

                    <input
                      ref={testSolutionFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleTestSolutionUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={testSolutionUploading}
                      onClick={() => testSolutionFileInputRef.current?.click()}
                      className="gap-1.5 border-teal-500/40 text-teal-600 hover:bg-teal-500/10 hover:text-teal-500"
                    >
                      {testSolutionUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      <span>Upload My Translation</span>
                    </Button>

                    {testSolutionUrl && !application.testSolutionUrl ? (
                      <Button
                        size="sm"
                        disabled={testSubmitting}
                        onClick={async () => {
                          setTestSubmitting(true);
                          try {
                            const svc = getServices();
                            await svc.application.updateApplicationStatus(application.$id, application.status, "pending", testSolutionUrl);
                            setApplication({ ...application, testSolutionUrl, testSubmittedAt: new Date().toISOString(), testStatus: "pending" as any });
                            toast({ title: "Test solution submitted!", variant: "success" });
                          } catch {
                            toast({ title: "Failed to submit test", variant: "destructive" });
                          } finally {
                            setTestSubmitting(false);
                          }
                        }}
                        className="h-8 text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-500 hover:to-emerald-500"
                      >
                        {testSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        Submit Test
                      </Button>
                    ) : null}
                    {application.testSolutionUrl && (
                      <span className="text-xs font-semibold flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        ✓ Solution Submitted
                      </span>
                    )}
                  </div>

                  {application.testFeedback && (
                    <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/10 relative z-10">
                      <span className="text-2xs font-semibold text-teal-600 uppercase tracking-wider">Feedback: </span>
                      <span className="text-xs text-muted-foreground">{application.testFeedback}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>This is your job posting</CardTitle>
              <CardDescription>View applications in your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => router.push("/dashboard/company/jobs")}>
                Go to My Jobs
              </Button>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card>
            <CardHeader>
              <CardTitle>Interested in this job?</CardTitle>
              <CardDescription>Sign in to apply</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => router.push("/login")}>Sign in</Button>
              <Button variant="outline" onClick={() => router.push("/signup")}>Create account</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
