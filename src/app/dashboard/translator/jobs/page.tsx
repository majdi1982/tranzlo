"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, Filter, Search, SlidersHorizontal, MapPin, Globe, DollarSign, Calendar } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LANGUAGES, getLanguageName } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";
import type { Job } from "@/types";

export default function BrowseJobsPage() {
  const { user } = useSession();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sourceLang, setSourceLang] = React.useState("");
  const [targetLang, setTargetLang] = React.useState("");
  const [specFilter, setSpecFilter] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const allJobs = await services.job.getJobs({ status: "open" });
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
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = jobs.filter((job) => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (sourceLang && job.sourceLanguage !== sourceLang) return false;
    if (targetLang && job.targetLanguage !== targetLang) return false;
    if (specFilter && !job.specializations?.includes(specFilter)) return false;
    return true;
  });

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["translator"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Browse Jobs</h1>
            <p className="text-muted-foreground">Find translation projects that match your skills</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Source Language</label>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Target Language</label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Specialization</label>
                  <Select value={specFilter} onValueChange={setSpecFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((job) => (
                <Link key={job.$id} href={`/jobs/${job.$id}`}>
                  <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate flex items-center gap-2">
                            {job.title}
                            {job.visibility === "private" && (
                              <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 text-[10px] py-0 px-1 uppercase tracking-wider">Invited</Badge>
                            )}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {(() => {
                                const srcs = (job.sourceLanguage || "").split(",").map(s => s.trim()).filter(Boolean);
                                const tgts = (job.targetLanguage || "").split(",").map(t => t.trim()).filter(Boolean);
                                return srcs.flatMap(src => tgts.map(tgt => `${getLanguageName(src)} → ${getLanguageName(tgt)}`)).join(" · ");
                              })()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.workType === "online" ? "Remote" : job.country ?? "On-site"}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              ${job.budget}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {job.specializations?.[0] ?? "General"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
