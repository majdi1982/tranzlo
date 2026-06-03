"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpDown, Briefcase, ChevronDown, Clock, DollarSign, Globe, Star, Search, SlidersHorizontal, UserCheck, X, Check } from "lucide-react";
import { getServices } from "@/services";
import type { TranslatorProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";

function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

export default function TranslatorsPage() {
  const [translators, setTranslators] = React.useState<TranslatorProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [nativeLang, setNativeLang] = React.useState("");
  const [specFilter, setSpecFilter] = React.useState("");
  const [catToolFilter, setCatToolFilter] = React.useState("");
  const [sort, setSort] = React.useState<"rating" | "rate_high" | "rate_low" | "experience">("rating");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const data = await services.profile.listPublicTranslators();
        setTranslators(data);
      } catch (err) {
        console.error("Error loading public translators:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = React.useMemo(() => {
    let result = [...translators];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          (t.bio && t.bio.toLowerCase().includes(q)) ||
          t.languages.some((l) => getLanguageName(l).toLowerCase().includes(q))
      );
    }

    if (nativeLang) {
      result = result.filter((t) => t.languages.includes(nativeLang));
    }

    if (specFilter) {
      result = result.filter((t) => t.specializations?.includes(specFilter));
    }

    if (catToolFilter) {
      result = result.filter((t) => t.catTools?.some((c) => c.toLowerCase().includes(catToolFilter.toLowerCase())));
    }

    result.sort((a, b) => {
      // Priority 1: Verified status first
      const vA = a.isVerified ? 1 : 0;
      const vB = b.isVerified ? 1 : 0;
      if (vA !== vB) return vB - vA;

      // Priority 2: Selected sort option
      switch (sort) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "rate_high":
          return (b.hourlyRate || 0) - (a.hourlyRate || 0);
        case "rate_low":
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case "experience":
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [translators, search, nativeLang, specFilter, catToolFilter, sort]);

  const activeFilterCount = [nativeLang, specFilter, catToolFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Professional Language Experts
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect with verified freelance translators, proofreaders, and interpreters across 50+ languages.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search translators by name, bio, or language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-card border-border rounded-xl"
            />
          </div>
        </div>

        {/* Directory Listing Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading Specialists..." : `${filtered.length} translator${filtered.length !== 1 ? "s" : ""} found`}
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden h-9 text-xs rounded-md"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              Filters {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </Button>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger className="w-[160px] h-9 text-xs bg-card border-border rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="rate_high">Rate: High to Low</SelectItem>
                  <SelectItem value="rate_low">Rate: Low to High</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className={`space-y-6 w-full lg:w-64 shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="glass-card bg-card/40 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setNativeLang("");
                      setSpecFilter("");
                      setCatToolFilter("");
                    }}
                    className="text-2xs text-primary hover:underline font-semibold"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-2xs font-bold text-muted-foreground">Native Language</label>
                <Select value={nativeLang || "all"} onValueChange={(v) => setNativeLang(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-xs bg-background border-border rounded-md">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
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
                <label className="text-2xs font-bold text-muted-foreground">Specialization</label>
                <Select value={specFilter || "all"} onValueChange={(v) => setSpecFilter(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-xs bg-background border-border rounded-md">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
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
                <label className="text-2xs font-bold text-muted-foreground">CAT Tool Skill</label>
                <Input
                  placeholder="e.g. Trados, MemoQ..."
                  value={catToolFilter}
                  onChange={(e) => setCatToolFilter(e.target.value)}
                  className="h-9 text-xs bg-background border-border rounded-md"
                />
              </div>
            </div>
          </aside>

          {/* Directory Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="glass-card bg-card/20 border-border rounded-2xl h-52 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-card/20 border border-border rounded-2xl space-y-4">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
                <h3 className="text-lg font-bold text-foreground">No Specialists Listed</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No translators have made their profile public yet or completed the onboarding setup.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((t) => (
                  <Card key={t.$id} className="glass-card bg-card/40 border-border hover:border-primary/40 rounded-2xl shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <div className="relative h-12 w-12 shrink-0">
                          {t.avatarUrl ? (
                            <div className="relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-primary/20">
                              <Image src={t.avatarUrl} alt={t.fullName} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="h-full w-full rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base ring-1 ring-primary/20">
                              {t.fullName
                                ? t.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "?"}
                            </div>
                          )}
                          {t.isVerified && (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 border-2 border-background shadow-md">
                              <Check className="h-2 w-2 text-white" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-bold text-foreground truncate">{t.fullName}</CardTitle>
                            {t.isVerified && (
                              <UserCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                            )}
                          </div>
                          <CardDescription className="text-xs text-muted-foreground mt-1 truncate">
                            Native: {getLanguageName(t.languages?.[0])}
                          </CardDescription>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-primary">${t.hourlyRate || 0}/hr</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4 space-y-3 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {t.bio || "No professional overview available."}
                      </p>
                      
                      <div className="space-y-2">
                        {t.catTools && t.catTools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {t.catTools.map((c) => (
                              <Badge key={c} variant="secondary" className="text-[10px] py-0.5 px-2 bg-background border border-border text-muted-foreground">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {t.specializations && t.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {t.specializations.map((s) => (
                              <Badge key={s} className="text-[10px] py-0.5 px-2 bg-primary/10 border border-primary/20 text-primary">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={t.isVerified ? "text-[8px] h-3.5 py-0 px-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md font-bold" : "text-[8px] h-3.5 py-0 px-1 bg-muted text-muted-foreground border-border/40 rounded-md font-medium"}>
                          {t.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-bold text-foreground text-[10px]">{t.rating || 0}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold">Exp: {t.yearsOfExperience || 0} yrs</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
