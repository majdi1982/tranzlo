"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Clock, DollarSign, Globe, Loader2, MapPin, Send, Star, TestTube } from "lucide-react";
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
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const isOwner = user && job?.companyId === user.$id;

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const jobData = await services.job.getJob(params.id as string);
        if (!jobData) return;
        setJob(jobData);
        setBidAmount(String(jobData.budget));

        const [companyData, myApps] = await Promise.all([
          services.profile.getCompanyProfile(jobData.companyId),
          user ? services.application.getMyApplications(user.$id) : Promise.resolve([]),
        ]);
        setCompany(companyData);
        const existing = myApps.find((a) => a.jobId === jobData.$id);
        if (existing) setApplication(existing);

        if (user && user.prefs?.role === "translator") {
          const profileData = await services.profile.getTranslatorProfile(user.$id);
          setTranslatorProfile(profileData);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, user?.$id]);

  async function handleApply() {
    if (!user) return;
    setSubmitting(true);
    try {
      const services = getServices();
      await services.application.apply({
        jobId: job!.$id,
        coverLetter,
        translatorId: user.$id,
        bidAmount: bidAmount ? Number(bidAmount) : undefined
      });
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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="text-3xl font-bold text-primary shrink-0">${job.budget.toLocaleString()}</p>
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
                : "The translator will arrange their own reviewer."}
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
                <p className="text-xs text-muted-foreground">You can negotiate the price by proposing your preferred bid amount (client budget: ${job.budget.toLocaleString()}).</p>
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
              {job.requiresTest && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  <TestTube className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>This job requires a translation test. You will receive the test after submitting your application.</span>
                </div>
              )}
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
