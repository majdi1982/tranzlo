"use client";

import * as React from "react";
import { Briefcase, Search, SlidersHorizontal, MapPin, Globe, DollarSign, Calendar, Send, Loader2, CheckCircle2, TestTube, Clock, X, FileText } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LANGUAGES, getLanguageName } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";
import { SERVICE_TYPES } from "@/data/service-types";
import type { Job, TranslatorProfile } from "@/types";
import { cn } from "@/lib/utils";

export default function BrowseJobsPage() {
  const { user } = useSession();
  const { toast } = useToast();

  // Jobs state
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sourceLang, setSourceLang] = React.useState("");
  const [targetLang, setTargetLang] = React.useState("");
  const [specFilter, setSpecFilter] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  // Apply sheet state
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [translatorProfile, setTranslatorProfile] = React.useState<TranslatorProfile | null>(null);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [bidAmount, setBidAmount] = React.useState("");
  const [selectedPair, setSelectedPair] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const [allJobs, profileData, myApps] = await Promise.all([
          services.job.getJobs({ status: "open" }),
          services.profile.getTranslatorProfile(user.$id),
          services.application.getMyApplications(user.$id),
        ]);

        const visibleJobs = allJobs.filter(j => {
          if (j.visibility === "public" || !j.visibility) return true;
          if (j.visibility === "private" && user?.$id) {
            if (j.invitationStatus) {
              try {
                const statusObj = JSON.parse(j.invitationStatus);
                if (statusObj[user.$id]) return true;
              } catch {}
            }
          }
          return false;
        });

        setJobs(visibleJobs);
        setTranslatorProfile(profileData);
        setAppliedJobIds(new Set(myApps.map(a => a.jobId)));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.$id]);

  function openApplySheet(job: Job) {
    setSelectedJob(job);
    setCoverLetter("");
    setBidAmount(String(job.budgetMax || job.budget));

    const srcLangs = job.sourceLanguage ? job.sourceLanguage.split(",").map(s => s.trim()) : [];
    const tgtLangs = job.targetLanguage ? job.targetLanguage.split(",").map(t => t.trim()) : [];
    if (srcLangs.length > 0 && tgtLangs.length > 0) {
      setSelectedPair(`${srcLangs[0]}-${tgtLangs[0]}`);
    }
  }

  async function handleApply() {
    if (!user || !selectedJob) return;

    const min = selectedJob.budgetMin || 0;
    const max = selectedJob.budgetMax || selectedJob.budget;
    const bidVal = Number(bidAmount);

    if (bidVal < min || bidVal > max) {
      toast({ title: `Bid must be between $${min} – $${max} USD`, variant: "destructive" });
      return;
    }
    if (!selectedPair) {
      toast({ title: "Please select a language pair", variant: "destructive" });
      return;
    }
    if (coverLetter.trim().length < 20) {
      toast({ title: "Cover letter must be at least 20 characters", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const services = getServices();
      const [src, tgt] = selectedPair.split("-");
      const friendlyPair = `${src.toUpperCase()} → ${tgt.toUpperCase()}`;

      await services.application.apply({
        jobId: selectedJob.$id,
        coverLetter: coverLetter.trim(),
        translatorId: user.$id,
        bidAmount: bidVal,
        languagePair: friendlyPair,
      } as any);

      setAppliedJobIds(prev => new Set([...prev, selectedJob.$id]));
      toast({ title: "Application submitted!", description: `You applied for "${selectedJob.title}"`, variant: "success" });
      setSelectedJob(null);
    } catch (err: any) {
      toast({ title: "Failed to apply", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = jobs.filter(job => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (sourceLang && sourceLang !== "all" && !job.sourceLanguage?.includes(sourceLang)) return false;
    if (targetLang && targetLang !== "all" && !job.targetLanguage?.includes(targetLang)) return false;
    if (specFilter && specFilter !== "all" && !job.specializations?.includes(specFilter)) return false;
    return true;
  });

  // Compute language pairs for selected job
  const jobPairs = React.useMemo(() => {
    if (!selectedJob) return [];
    const srcs = selectedJob.sourceLanguage ? selectedJob.sourceLanguage.split(",").map(s => s.trim()) : [];
    const tgts = selectedJob.targetLanguage ? selectedJob.targetLanguage.split(",").map(t => t.trim()) : [];
    const pairs: { id: string; src: string; tgt: string }[] = [];
    srcs.forEach(s => tgts.forEach(t => pairs.push({ id: `${s}-${t}`, src: s, tgt: t })));
    return pairs;
  }, [selectedJob]);

  const transLangs = translatorProfile?.languages || [];

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["translator"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Browse Jobs</h1>
            <p className="text-muted-foreground text-sm">Find translation projects that match your skills</p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("gap-2 rounded-xl", showFilters && "bg-accent")}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <Card className="border-border/40">
              <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Language</label>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger className="rounded-lg"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {LANGUAGES.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Language</label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="rounded-lg"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {LANGUAGES.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specialization</label>
                  <Select value={specFilter} onValueChange={setSpecFilter}>
                    <SelectTrigger className="rounded-lg"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {SPECIALIZATIONS.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Job List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border/50 rounded-2xl">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-base font-semibold">No jobs found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(job => {
                const alreadyApplied = appliedJobIds.has(job.$id);
                const srcs = (job.sourceLanguage || "").split(",").map(s => s.trim()).filter(Boolean);
                const tgts = (job.targetLanguage || "").split(",").map(t => t.trim()).filter(Boolean);
                const langLabel = srcs.flatMap(s => tgts.map(t => `${getLanguageName(s)} → ${getLanguageName(t)}`)).join(" · ");

                return (
                  <Card
                    key={job.$id}
                    className="glass-card border-border/40 rounded-2xl overflow-hidden hover:shadow-lg hover:border-border/60 transition-all duration-300"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          {/* Title row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm tracking-tight text-foreground/90 truncate">
                              {job.title}
                            </h3>
                            {job.visibility === "private" && (
                              <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] py-0 px-1.5 uppercase tracking-wider">
                                Invited
                              </Badge>
                            )}
                            {job.requiresTest && (
                              <Badge variant="secondary" className="text-[10px] flex items-center gap-0.5">
                                <TestTube className="h-2.5 w-2.5" /> Test
                              </Badge>
                            )}
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {langLabel}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {job.workType === "online" ? "Remote" : job.country ?? "On-site"}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-teal-600">
                              <DollarSign className="h-3.5 w-3.5" />
                              {job.budgetMin && job.budgetMax && job.budgetMin !== job.budgetMax
                                ? `$${job.budgetMin} – $${job.budgetMax}`
                                : `$${job.budget}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Specializations */}
                          {job.specializations && job.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {job.specializations.slice(0, 3).map(s => (
                                <Badge key={s} variant="secondary" className="text-[10px] rounded-md px-1.5 py-0">
                                  {s}
                                </Badge>
                              ))}
                              {job.specializations.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">+{job.specializations.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {alreadyApplied ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Applied
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs font-semibold shadow-sm"
                              onClick={() => openApplySheet(job)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Apply Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Apply Sheet ─── */}
        <Sheet open={!!selectedJob} onOpenChange={open => !open && setSelectedJob(null)}>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
            {selectedJob && (
              <>
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <SheetTitle className="text-base leading-snug">{selectedJob.title}</SheetTitle>
                      <SheetDescription className="text-xs flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-teal-600">
                          <DollarSign className="h-3 w-3" />
                          ${selectedJob.budgetMin || selectedJob.budget} – ${selectedJob.budgetMax || selectedJob.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                        </span>
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                  {/* Description */}
                  <div className="p-4 rounded-xl bg-accent/30 border border-border/30 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {selectedJob.description}
                  </div>

                  {/* Services summary */}
                  {selectedJob.services && (() => {
                    try {
                      const svcs = JSON.parse(selectedJob.services);
                      if (!Array.isArray(svcs) || svcs.length === 0) return null;
                      return (
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Services Required
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {svcs.map((s: any, i: number) => {
                              const st = SERVICE_TYPES.find(t => t.id === s.serviceId);
                              return (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {st?.name ?? s.serviceId} · {s.quantity?.toLocaleString()} {s.unit}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } catch { return null; }
                  })()}

                  <Separator />

                  {/* Language Pair Selector */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select Language Pair
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {jobPairs.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No language pairs defined.</p>
                      ) : jobPairs.map(p => {
                        const isSelected = selectedPair === p.id;
                        const isDisabled = transLangs.length > 0 && (!transLangs.includes(p.src) || !transLangs.includes(p.tgt));
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => !isDisabled && setSelectedPair(p.id)}
                            className={cn(
                              "flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left",
                              isDisabled
                                ? "opacity-50 cursor-not-allowed border-border/30 bg-muted/20 text-muted-foreground"
                                : isSelected
                                  ? "border-teal-500 bg-teal-500/10 text-foreground shadow-[0_0_12px_rgba(20,184,166,0.15)]"
                                  : "border-border/40 bg-background hover:border-teal-400/60 hover:bg-teal-500/5 cursor-pointer"
                            )}
                          >
                            <span>{getLanguageName(p.src)} → {getLanguageName(p.tgt)}</span>
                            <div className={cn(
                              "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                              isSelected ? "border-teal-500 bg-teal-500" : "border-border"
                            )}>
                              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {transLangs.length === 0 && (
                      <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200/60 px-3 py-2 rounded-lg">
                        ⚠ Add languages to your profile to enable pair validation.
                      </p>
                    )}
                  </div>

                  {/* Bid Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Proposed Bid (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder={String(selectedJob.budget)}
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        className="pl-9 rounded-xl h-11"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Budget range:{" "}
                      <span className="font-semibold text-foreground">
                        ${selectedJob.budgetMin || 0} – ${selectedJob.budgetMax || selectedJob.budget} USD
                      </span>
                    </p>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Cover Letter
                    </label>
                    <Textarea
                      placeholder="Introduce yourself and explain why you are the best fit for this project..."
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      className="min-h-[140px] resize-none rounded-xl text-sm"
                    />
                    <p className={cn(
                      "text-[11px] text-right transition-colors",
                      coverLetter.length < 20 ? "text-muted-foreground" : "text-teal-600"
                    )}>
                      {coverLetter.length} / 20 min chars
                    </p>
                  </div>

                  {/* Test notice */}
                  {selectedJob.requiresTest && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/60">
                      <TestTube className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-indigo-800">Translation Test Required</p>
                        <p className="text-[11px] text-indigo-700/80 mt-0.5">
                          After applying, you may be invited to complete a translation test ({selectedJob.testWordCount || 250} words, {selectedJob.testDuration || 48}h deadline).
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-border/40 bg-background flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setSelectedJob(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white gap-2 font-semibold shadow-md shadow-teal-600/20"
                    onClick={handleApply}
                    disabled={submitting || coverLetter.trim().length < 20 || !bidAmount || !selectedPair}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Application
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

      </RoleGuard>
    </AuthGuard>
  );
}
