"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowUpDown, Briefcase, ChevronDown, Clock, DollarSign, Globe, Star, Search, 
  SlidersHorizontal, UserCheck, Users, X, ExternalLink, ArrowRight, BookOpen, Settings, Check
} from "lucide-react";
import { getServices } from "@/services";
import type { TranslatorProfile, CompanyProfile, Job } from "@/types";
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

export default function SearchHubPage() {
  const [activeTab, setActiveTab] = React.useState<"translators" | "companies" | "jobs">("translators");
  
  // Data lists
  const [translators, setTranslators] = React.useState<TranslatorProfile[]>([]);
  const [companies, setCompanies] = React.useState<CompanyProfile[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Unified Text Search
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filters - Translators
  const [nativeLang, setNativeLang] = React.useState("");
  const [specFilter, setSpecFilter] = React.useState("");
  const [catToolFilter, setCatToolFilter] = React.useState("");
  const [rateMin, setRateMin] = React.useState("");
  const [rateMax, setRateMax] = React.useState("");
  const [expMin, setExpMin] = React.useState("");
  const [verifiedOnlyTranslators, setVerifiedOnlyTranslators] = React.useState(false);
  const [sortTranslators, setSortTranslators] = React.useState<"rating" | "rate_high" | "rate_low" | "experience">("rating");

  // Filters - Companies
  const [companySizeFilter, setCompanySizeFilter] = React.useState("");
  const [verifiedOnlyCompanies, setVerifiedOnlyCompanies] = React.useState(false);
  const [sortCompanies, setSortCompanies] = React.useState<"name" | "newest">("name");

  // Filters - Jobs
  const [sourceLang, setSourceLang] = React.useState("");
  const [targetLang, setTargetLang] = React.useState("");
  const [jobSpecFilter, setJobSpecFilter] = React.useState("");
  const [budgetMin, setBudgetMin] = React.useState("");
  const [budgetMax, setBudgetMax] = React.useState("");
  const [sortJobs, setSortJobs] = React.useState<"newest" | "budget_high" | "budget_low">("newest");

  // Layout states
  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);

  // Load resources
  React.useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const services = getServices();
        const [translatorsData, companiesData, jobsData] = await Promise.all([
          services.profile.listPublicTranslators(),
          services.profile.listPublicCompanies(),
          services.job.getJobs({ status: "open" })
        ]);
        setTranslators(translatorsData);
        setCompanies(companiesData);
        setJobs(jobsData);
      } catch (err) {
        console.error("Failed to load search directory data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // Filter & Sort Translators
  const filteredTranslators = React.useMemo(() => {
    let result = [...translators];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          (t.bio && t.bio.toLowerCase().includes(q)) ||
          t.languages.some((l) => getLanguageName(l).toLowerCase().includes(q)) ||
          t.specializations?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (nativeLang) {
      result = result.filter((t) => t.languages.includes(nativeLang));
    }

    if (specFilter) {
      result = result.filter((t) => t.specializations?.includes(specFilter));
    }

    if (catToolFilter.trim()) {
      const catQ = catToolFilter.toLowerCase();
      result = result.filter((t) => t.catTools?.some((c) => c.toLowerCase().includes(catQ)));
    }

    if (rateMin) {
      result = result.filter((t) => (t.hourlyRate || 0) >= parseFloat(rateMin));
    }

    if (rateMax) {
      result = result.filter((t) => (t.hourlyRate || 0) <= parseFloat(rateMax));
    }

    if (expMin) {
      result = result.filter((t) => (t.yearsOfExperience || 0) >= parseInt(expMin, 10));
    }

    if (verifiedOnlyTranslators) {
      result = result.filter((t) => t.isVerified);
    }

    switch (sortTranslators) {
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "rate_high":
        result.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
        break;
      case "rate_low":
        result.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
      case "experience":
        result.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
        break;
    }

    return result;
  }, [translators, searchQuery, nativeLang, specFilter, catToolFilter, rateMin, rateMax, expMin, verifiedOnlyTranslators, sortTranslators]);

  // Filter & Sort Companies
  const filteredCompanies = React.useMemo(() => {
    let result = [...companies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          (c.about && c.about.toLowerCase().includes(q)) ||
          c.fullName.toLowerCase().includes(q)
      );
    }

    if (companySizeFilter) {
      result = result.filter((c) => c.companySize === companySizeFilter);
    }

    if (verifiedOnlyCompanies) {
      result = result.filter((c) => c.isVerified);
    }

    switch (sortCompanies) {
      case "name":
        result.sort((a, b) => a.companyName.localeCompare(b.companyName));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return result;
  }, [companies, searchQuery, companySizeFilter, verifiedOnlyCompanies, sortCompanies]);

  // Filter & Sort Jobs
  const filteredJobs = React.useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.description && j.description.toLowerCase().includes(q))
      );
    }

    if (sourceLang) {
      result = result.filter((j) => j.sourceLanguage === sourceLang);
    }

    if (targetLang) {
      result = result.filter((j) => j.targetLanguage === targetLang);
    }

    if (jobSpecFilter) {
      result = result.filter((j) => j.specializations?.includes(jobSpecFilter));
    }

    if (budgetMin) {
      result = result.filter((j) => (j.budget || 0) >= parseFloat(budgetMin));
    }

    if (budgetMax) {
      result = result.filter((j) => (j.budget || 0) <= parseFloat(budgetMax));
    }

    switch (sortJobs) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "budget_high":
        result.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case "budget_low":
        result.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
    }

    return result;
  }, [jobs, searchQuery, sourceLang, targetLang, jobSpecFilter, budgetMin, budgetMax, sortJobs]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setNativeLang("");
    setSpecFilter("");
    setCatToolFilter("");
    setRateMin("");
    setRateMax("");
    setExpMin("");
    setVerifiedOnlyTranslators(false);
    setCompanySizeFilter("");
    setVerifiedOnlyCompanies(false);
    setSourceLang("");
    setTargetLang("");
    setJobSpecFilter("");
    setBudgetMin("");
    setBudgetMax("");
  };

  const getActiveFilterCount = () => {
    if (activeTab === "translators") {
      return [nativeLang, specFilter, catToolFilter, rateMin, rateMax, expMin].filter(Boolean).length + (verifiedOnlyTranslators ? 1 : 0);
    } else if (activeTab === "companies") {
      return [companySizeFilter].filter(Boolean).length + (verifiedOnlyCompanies ? 1 : 0);
    } else {
      return [sourceLang, targetLang, jobSpecFilter, budgetMin, budgetMax].filter(Boolean).length;
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      {/* Background glow effects - Pure 0px sharp geometry */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10 space-y-10">
        {/* Page Title & Premium Centered Staggered Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Global Search Center
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Search translators, organizations, or active translation projects instantly using advanced attributes indexing.
          </p>

          {/* Large Stylized Search Bar Console */}
          <div className="relative max-w-2xl mx-auto mt-6 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-none blur-sm opacity-25 group-focus-within:opacity-60 transition duration-300" />
            <div className="relative flex items-center bg-card border border-border">
              <Search className="ml-4 h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                placeholder={
                  activeTab === "translators" 
                    ? "Search translators by name, bio, tags..." 
                    : activeTab === "companies" 
                      ? "Search organizations by name or profile bio..."
                      : "Search active projects by title or description..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 pr-4 h-12 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60 text-sm w-full rounded-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="p-1 mr-2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab switch controller */}
        <div className="max-w-md mx-auto flex items-center justify-center p-0.5 bg-card border border-border">
          {(["translators", "companies", "jobs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowFiltersMobile(false);
              }}
              className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab 
                  ? "bg-gradient-to-r from-cyan-950 to-teal-950 text-cyan-400 border border-cyan-500/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Control bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-5">
          <p className="text-xs text-muted-foreground font-medium">
            {loading ? (
              "Querying Database..."
            ) : activeTab === "translators" ? (
              `${filteredTranslators.length} Translator${filteredTranslators.length !== 1 ? "s" : ""} Indexed`
            ) : activeTab === "companies" ? (
              `${filteredCompanies.length} Compan${filteredCompanies.length !== 1 ? "ies" : "y"} Indexed`
            ) : (
              `${filteredJobs.length} Project${filteredJobs.length !== 1 ? "s" : ""} Live`
            )}
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden h-8 text-2xs uppercase tracking-wider rounded-none border-border"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              {activeTab === "translators" && (
                <Select value={sortTranslators} onValueChange={(v) => setSortTranslators(v as any)}>
                  <SelectTrigger className="w-[150px] h-8 text-2xs uppercase tracking-wider bg-slate-900 border-slate-800 rounded-none text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 rounded-none">
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="rate_high">Rate: High to Low</SelectItem>
                    <SelectItem value="rate_low">Rate: Low to High</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {activeTab === "companies" && (
                <Select value={sortCompanies} onValueChange={(v) => setSortCompanies(v as any)}>
                  <SelectTrigger className="w-[150px] h-8 text-2xs uppercase tracking-wider bg-slate-900 border-slate-800 rounded-none text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 rounded-none">
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="newest">Newest Listed</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {activeTab === "jobs" && (
                <Select value={sortJobs} onValueChange={(v) => setSortJobs(v as any)}>
                  <SelectTrigger className="w-[150px] h-8 text-2xs uppercase tracking-wider bg-slate-900 border-slate-800 rounded-none text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 rounded-none">
                    <SelectItem value="newest">Newest Listed</SelectItem>
                    <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                    <SelectItem value="budget_low">Budget: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Search Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Dynamic Sidebar Filters - Desktop */}
          <aside className={`w-full lg:w-64 shrink-0 space-y-6 ${showFiltersMobile ? "block" : "hidden"} lg:block`}>
            <div className="bg-card/40 border border-border p-5 space-y-5 rounded-none">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-2xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
                  Parameters
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Translators Filtering Options */}
              {activeTab === "translators" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Native Language</label>
                    <Select value={nativeLang || "all"} onValueChange={(v) => setNativeLang(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-2xs bg-background border-border rounded-none">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground rounded-none">
                        <SelectItem value="all">Any</SelectItem>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Specialization</label>
                    <Select value={specFilter || "all"} onValueChange={(v) => setSpecFilter(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-2xs bg-background border-border rounded-none">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground rounded-none">
                        <SelectItem value="all">Any</SelectItem>
                        {SPECIALIZATIONS.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CAT Tool Skill</label>
                    <Input
                      placeholder="e.g. Trados, MemoQ"
                      value={catToolFilter}
                      onChange={(e) => setCatToolFilter(e.target.value)}
                      className="h-8 text-2xs bg-background border-border rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hourly Rate Range ($)</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={rateMin}
                        onChange={(e) => setRateMin(e.target.value)}
                        className="h-8 text-2xs bg-background border-border rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                      />
                      <span className="text-muted-foreground text-xs">-</span>
                      <Input
                        placeholder="Max"
                        type="number"
                        value={rateMax}
                        onChange={(e) => setRateMax(e.target.value)}
                        className="h-8 text-2xs bg-background border-border rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Years Experience</label>
                    <Input
                      placeholder="e.g. 5"
                      type="number"
                      value={expMin}
                      onChange={(e) => setExpMin(e.target.value)}
                      className="h-8 text-2xs bg-background border-border rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <input
                      type="checkbox"
                      id="verifiedTranslators"
                      checked={verifiedOnlyTranslators}
                      onChange={(e) => setVerifiedOnlyTranslators(e.target.checked)}
                      className="rounded-none border-border bg-background text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="verifiedTranslators" className="text-[10px] font-bold text-foreground uppercase tracking-wider cursor-pointer flex items-center gap-1 select-none">
                      <UserCheck className="h-3 w-3 text-cyan-400" />
                      Verified Only
                    </label>
                  </div>
                </div>
              )}

              {/* Companies Filtering Options */}
              {activeTab === "companies" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Company Size</label>
                    <Select value={companySizeFilter || "all"} onValueChange={(v) => setCompanySizeFilter(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-2xs bg-background border-border rounded-none">
                        <SelectValue placeholder="Any size" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground rounded-none">
                        <SelectItem value="all">Any Size</SelectItem>
                        <SelectItem value="1-10">1-10 Employees</SelectItem>
                        <SelectItem value="11-50">11-50 Employees</SelectItem>
                        <SelectItem value="51-200">51-200 Employees</SelectItem>
                        <SelectItem value="201+">201+ Employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <input
                      type="checkbox"
                      id="verifiedCompanies"
                      checked={verifiedOnlyCompanies}
                      onChange={(e) => setVerifiedOnlyCompanies(e.target.checked)}
                      className="rounded-none border-border bg-background text-cyan-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="verifiedCompanies" className="text-[10px] font-bold text-foreground uppercase tracking-wider cursor-pointer flex items-center gap-1 select-none">
                      <UserCheck className="h-3 w-3 text-cyan-400" />
                      Verified Only
                    </label>
                  </div>
                </div>
              )}

              {/* Jobs Filtering Options */}
              {activeTab === "jobs" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Source Language</label>
                    <Select value={sourceLang || "all"} onValueChange={(v) => setSourceLang(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-2xs bg-background border-border rounded-none">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground rounded-none">
                        <SelectItem value="all">Any</SelectItem>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Language</label>
                    <Select value={targetLang || "all"} onValueChange={(v) => setTargetLang(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-2xs bg-background border-border rounded-none">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground rounded-none">
                        <SelectItem value="all">Any</SelectItem>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Specialization</label>
                    <Select value={jobSpecFilter || "all"} onValueChange={(v) => setJobSpecFilter(v === "all" ? "" : v)}>
                      <SelectTrigger className="h-8 text-2xs bg-background border-border rounded-none">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground rounded-none">
                        <SelectItem value="all">Any</SelectItem>
                        {SPECIALIZATIONS.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Budget Range ($)</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="h-8 text-2xs bg-background border-border rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                      />
                      <span className="text-muted-foreground text-xs">-</span>
                      <Input
                        placeholder="Max"
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="h-8 text-2xs bg-background border-border rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-card/20 border-border rounded-none h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Translators Tab view */}
                {activeTab === "translators" && (
                  filteredTranslators.length === 0 ? (
                    <div className="text-center py-20 bg-card/10 border border-border rounded-none space-y-4">
                      <Globe className="h-10 w-10 mx-auto text-muted-foreground animate-pulse" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No matching specialists</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        We couldn't find any public language experts fitting these filters. Try broadening your criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredTranslators.map((t) => (
                        <Card
                          key={t.$id}
                          className="bg-card/30 border-border hover:border-cyan-500/30 rounded-none transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <Link href={`/profile?userId=${t.userId}`} className="block group/link flex-1 flex flex-col">
                            <CardHeader className="pb-2.5">
                              <div className="flex items-start gap-3.5">
                                <div className="relative h-11 w-11 shrink-0">
                                  {t.avatarUrl ? (
                                    <div className="relative h-full w-full overflow-hidden border border-cyan-500/20">
                                      <Image src={t.avatarUrl} alt={t.fullName} fill className="object-cover" />
                                    </div>
                                  ) : (
                                    <div className="h-full w-full bg-cyan-950/20 text-cyan-400 flex items-center justify-center font-black text-sm border border-cyan-500/20">
                                      {t.fullName
                                        ? t.fullName
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)
                                        : "?"}
                                    </div>
                                  )}
                                  {t.isVerified && (
                                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 border border-background shadow-md">
                                      <Check className="h-2.5 w-2.5 text-white" />
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <CardTitle className="text-sm font-bold text-foreground group-hover/link:text-cyan-400 transition-colors truncate">{t.fullName}</CardTitle>
                                    {t.isVerified && (
                                      <UserCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                    <span className="flex items-center text-amber-400 gap-0.5">
                                      <Star className="h-3 w-3 fill-current" />
                                      {t.rating ? t.rating.toFixed(1) : "0.0"}
                                    </span>
                                    <span className="text-border">•</span>
                                    <span className="flex items-center gap-0.5">
                                      <DollarSign className="h-3 w-3 text-emerald-400" />
                                      {t.hourlyRate || "0"}/hr
                                    </span>
                                    <span className="text-border">•</span>
                                    <span>{t.yearsOfExperience || "0"} yrs exp</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3 flex-1">
                              <p className="text-2xs text-muted-foreground line-clamp-3 leading-relaxed">
                                {t.bio || "No professional overview summary available."}
                              </p>
                              
                              {/* Languages tags */}
                              {t.languages && t.languages.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {t.languages.slice(0, 4).map((lang) => (
                                    <Badge key={lang} variant="secondary" className="text-[9px] px-1.5 py-0 bg-background border border-border text-muted-foreground rounded-none uppercase">
                                      {getLanguageName(lang)}
                                    </Badge>
                                  ))}
                                  {t.languages.length > 4 && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-background border border-border text-muted-foreground/80 rounded-none">
                                      +{t.languages.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Link>
                          <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between text-2xs text-muted-foreground">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Translator</span>
                            <div 
                              className="flex items-center gap-1 text-cyan-400 group-hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors text-[10px]"
                            >
                              Inspect Profile
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )
                )}

                {/* Companies Tab view */}
                {activeTab === "companies" && (
                  filteredCompanies.length === 0 ? (
                    <div className="text-center py-20 bg-card/10 border border-border rounded-none space-y-4">
                      <Briefcase className="h-10 w-10 mx-auto text-muted-foreground animate-pulse" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No matching partners</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        We couldn't find any public directories matching these filter parameters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredCompanies.map((c) => (
                        <Card key={c.$id} className="bg-card/30 border-border hover:border-cyan-500/30 rounded-none transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <Link href={`/profile?userId=${c.userId}`} className="block group/link flex-1 flex flex-col">
                            <CardHeader className="pb-2.5">
                              <div className="flex items-start gap-3.5">
                                <div className="relative h-11 w-11 shrink-0">
                                  {c.logoUrl ? (
                                    <div className="relative h-full w-full overflow-hidden border border-cyan-500/20">
                                      <Image src={c.logoUrl} alt={c.companyName} fill className="object-cover" />
                                    </div>
                                  ) : (
                                    <div className="h-full w-full bg-cyan-950/20 text-cyan-400 flex items-center justify-center font-black text-sm border border-cyan-500/20">
                                      {c.companyName
                                        ? c.companyName
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)
                                        : "?"}
                                    </div>
                                  )}
                                  {c.isVerified && (
                                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 border border-background shadow-md">
                                      <Check className="h-2.5 w-2.5 text-white" />
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <CardTitle className="text-sm font-bold text-foreground group-hover/link:text-cyan-400 transition-colors truncate">{c.companyName}</CardTitle>
                                    {c.isVerified && (
                                      <UserCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    Size: {c.companySize || "1-10"} Employees
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3 flex-1">
                              <p className="text-2xs text-muted-foreground line-clamp-3 leading-relaxed">
                                {c.about || "No corporate business summary available."}
                              </p>
                            </CardContent>
                          </Link>
                          <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between text-2xs text-muted-foreground">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Company</span>
                            <div className="flex items-center gap-3">
                              {c.website && (
                                <a 
                                  href={c.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                                >
                                  Website
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                              <div 
                                className="flex items-center gap-1 text-cyan-400 group-hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors text-[10px]"
                              >
                                View Profile
                                <ArrowRight className="h-3 w-3" />
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )
                )}

                {/* Jobs Tab view */}
                {activeTab === "jobs" && (
                  filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-card/10 border border-border rounded-none space-y-4">
                      <Briefcase className="h-10 w-10 mx-auto text-muted-foreground animate-pulse" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No active projects</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        No active assignments fit these specific requirements.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredJobs.map((j) => (
                        <Card key={j.$id} className="bg-card/30 border-border hover:border-cyan-500/30 rounded-none transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <Link href={`/jobs/${j.$id}`} className="block group/link flex-1 flex flex-col">
                            <CardHeader className="pb-2.5">
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-sm font-bold text-foreground group-hover/link:text-cyan-400 transition-colors truncate">{j.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1 text-cyan-400 bg-cyan-950/20 px-1 border border-cyan-500/10 text-[9px] uppercase tracking-wider font-bold">
                                    <Globe className="h-2.5 w-2.5" />
                                    {getLanguageName(j.sourceLanguage)} &rarr; {getLanguageName(j.targetLanguage)}
                                  </span>
                                  <span className="text-border">•</span>
                                  <span className="text-emerald-400 font-bold">${j.budget || "0"}</span>
                                  <span className="text-border">•</span>
                                  <span>{j.specializations?.join(", ") || "General"}</span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3 flex-1">
                              <p className="text-2xs text-muted-foreground line-clamp-3 leading-relaxed">
                                {j.description || "No project parameters description available."}
                              </p>
                            </CardContent>
                          </Link>
                          <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between text-2xs text-muted-foreground">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Active RFP</span>
                            <div 
                              className="flex items-center gap-1 text-cyan-400 group-hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors text-[10px]"
                            >
                              Bid on Project
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
