"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpDown, Briefcase, ChevronDown, Clock, DollarSign, Globe, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { getServices } from "@/services";
import type { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LANGUAGES } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";
import { SERVICE_TYPES } from "@/data/service-types";


const RECENT_SEARCHES_KEY = "tranzlo_recent_searches";

function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

interface ServiceSummaryItem {
  serviceId: string;
  quantity: number;
  unit?: string;
}

function getServiceSummary(servicesJson: string): string {
  try {
    const svcs: ServiceSummaryItem[] = JSON.parse(servicesJson);
    if (!Array.isArray(svcs) || svcs.length === 0) return "";
    return svcs
      .map((s) => {
        const st = SERVICE_TYPES.find((t) => t.id === s.serviceId);
        const unit = s.unit ?? "unit";
        return `${st?.nameAr ?? st?.name ?? s.serviceId} (${s.quantity.toLocaleString()} ${unit})`;
      })
      .join(", ");
  } catch {
    return "";
  }
}

export default function JobsPage() {
  const [allJobs, setAllJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sourceLang, setSourceLang] = React.useState("");
  const [targetLang, setTargetLang] = React.useState("");
  const [specFilter, setSpecFilter] = React.useState("");
  const [workTypeFilter, setWorkTypeFilter] = React.useState<string>("");
  const [sort, setSort] = React.useState<"newest" | "budget_high" | "budget_low" | "deadline">("newest");
  const [showFilters, setShowFilters] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const jobs = await services.job.getJobs({ status: "open" });
        setAllJobs(jobs);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();

    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  function saveSearch(query: string) {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }

  const filtered = React.useMemo(() => {
    let result = [...allJobs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          getLanguageName(job.sourceLanguage).toLowerCase().includes(q) ||
          getLanguageName(job.targetLanguage).toLowerCase().includes(q)
      );
    }
    if (sourceLang) result = result.filter((job) => job.sourceLanguage === sourceLang);
    if (targetLang) result = result.filter((job) => job.targetLanguage === targetLang);
    if (specFilter) result = result.filter((job) => job.specializations?.includes(specFilter));
    if (workTypeFilter) result = result.filter((job) => job.workType === workTypeFilter);

    switch (sort) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "budget_high":
        result.sort((a, b) => b.budget - a.budget);
        break;
      case "budget_low":
        result.sort((a, b) => a.budget - b.budget);
        break;
      case "deadline":
        result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
    }

    return result;
  }, [allJobs, search, sourceLang, targetLang, specFilter, workTypeFilter, sort]);

  const activeFilterCount = [sourceLang, targetLang, specFilter, workTypeFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Browse Translation Jobs</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find translation projects that match your skills and expertise
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, language, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveSearch(search);
                }}
                className="pl-9 h-12 text-base"
              />
            </div>

            {recentSearches.length > 0 && !search && (
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Recent:</span>
                {recentSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSearch(q)}
                    className="text-primary hover:underline"
                  >
                    {q}
                  </button>
                ))}
                <button onClick={clearRecentSearches} className="text-xs text-muted-foreground hover:text-destructive ml-2">
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${filtered.length} job${filtered.length !== 1 ? "s" : ""} found`}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </Button>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                  <SelectItem value="budget_low">Budget: Low to High</SelectItem>
                  <SelectItem value="deadline">Deadline: Soonest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`space-y-6 w-64 shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSourceLang("");
                      setTargetLang("");
                      setSpecFilter("");
                      setWorkTypeFilter("");
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-2">
                  <Label>Source Language</Label>
                <Select value={sourceLang} onValueChange={(v) => setSourceLang(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Language</Label>
                <Select value={targetLang} onValueChange={(v) => setTargetLang(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={specFilter} onValueChange={(v) => setSpecFilter(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select value={workTypeFilter || "all"} onValueChange={(v) => setWorkTypeFilter(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="online">Online / Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                  </CardContent>
                  <CardFooter>
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                  </CardFooter>
                </Card>
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search terms or filters to find more translation projects.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSourceLang("");
                    setTargetLang("");
                    setSpecFilter("");
                    setWorkTypeFilter("");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              filtered.map((job) => (
                <Link key={job.$id} href={`/jobs/${job.$id}`}>
                  <Card className="transition-colors hover:border-primary/50 hover:shadow-sm cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <Globe className="inline h-3.5 w-3.5 mr-1" />
                            {getLanguageName(job.sourceLanguage)} → {getLanguageName(job.targetLanguage)}
                          </CardDescription>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">${job.budget.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.specializations?.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      {job.services && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {getServiceSummary(job.services)}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-0">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.workType === "online" ? "Remote" : job.country ?? "On-site"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(job.deadline).toLocaleDateString()}
                        </span>
                        {job.requiresTest && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            Test required
                          </Badge>
                        )}
                      </div>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-muted-foreground">{children}</label>;
}
