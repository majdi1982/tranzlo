"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpDown, Briefcase, ChevronDown, ExternalLink, Globe, Search, SlidersHorizontal, UserCheck, Users, X, Check } from "lucide-react";
import { getServices } from "@/services";
import type { CompanyProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompaniesPage() {
  const [companies, setCompanies] = React.useState<CompanyProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sizeFilter, setSizeFilter] = React.useState("");
  const [sort, setSort] = React.useState<"name" | "newest">("name");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const data = await services.profile.listPublicCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Error loading public companies:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = React.useMemo(() => {
    let result = [...companies];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          (c.about && c.about.toLowerCase().includes(q)) ||
          c.fullName.toLowerCase().includes(q)
      );
    }

    if (sizeFilter) {
      result = result.filter((c) => c.companySize === sizeFilter);
    }

    switch (sort) {
      case "name":
        result.sort((a, b) => a.companyName.localeCompare(b.companyName));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return result;
  }, [companies, search, sizeFilter, sort]);

  const activeFilterCount = [sizeFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Hiring Entities & Organizations
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse through active corporate entities, language service providers, and brands posting translation jobs.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies by name or corporate bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-background border-border rounded-xl"
            />
          </div>
        </div>

        {/* Directory Listing Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading Directories..." : `${filtered.length} compan${filtered.length !== 1 ? "ies" : "y"} found`}
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
                <SelectTrigger className="w-[160px] h-9 text-xs bg-background border-border rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="name">Company Name A-Z</SelectItem>
                  <SelectItem value="newest">Newest Listed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className={`space-y-6 w-full lg:w-64 shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="glass-card bg-card/40 border border-border/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/85 pb-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSizeFilter("");
                    }}
                    className="text-2xs text-primary hover:underline font-semibold"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-2xs font-bold text-muted-foreground">Company Size</label>
                <Select value={sizeFilter || "all"} onValueChange={(v) => setSizeFilter(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 text-xs bg-background border-border rounded-md">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">Any Size</SelectItem>
                    <SelectItem value="1-10">1-10 Employees</SelectItem>
                    <SelectItem value="11-50">11-50 Employees</SelectItem>
                    <SelectItem value="51-200">51-200 Employees</SelectItem>
                    <SelectItem value="201+">201+ Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Directory Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="glass-card bg-muted/20 border-border rounded-2xl h-52 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 border border-border rounded-2xl space-y-4">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/60 animate-pulse" />
                <h3 className="text-lg font-bold text-foreground">No Companies Listed</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No hiring companies have opted to display their profile inside our public directory yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((c) => (
                  <Card key={c.$id} className="glass-card bg-card/40 border-border hover:border-primary/40 rounded-2xl shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <div className="relative h-12 w-12 shrink-0">
                          {c.logoUrl ? (
                            <div className="relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-cyan-500/20">
                              <Image src={c.logoUrl} alt={c.companyName} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="h-full w-full rounded-2xl bg-cyan-950/20 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-base ring-1 ring-cyan-500/20">
                              {c.companyName
                                ? c.companyName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "?"}
                            </div>
                          )}
                          {c.isVerified && (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 border-2 border-background shadow-md">
                              <Check className="h-2 w-2 text-white" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-bold text-foreground truncate">{c.companyName}</CardTitle>
                            {c.isVerified && (
                              <UserCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                            )}
                          </div>
                          <CardDescription className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground/80" />
                            Size: {c.companySize || "1-10"} Employees
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-4 flex-1">
                      <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                        {c.about || "No corporate profile summary available."}
                      </p>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium">Active Partner</span>
                        <Badge variant="outline" className={c.isVerified ? "text-[8px] h-3.5 py-0 px-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md font-bold" : "text-[8px] h-3.5 py-0 px-1 bg-muted text-muted-foreground border-border/40 rounded-md font-medium"}>
                          {c.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-primary hover:text-cyan-300 font-semibold transition-colors text-[10px]"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/60 text-[10px]">No website URL</span>
                      )}
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
