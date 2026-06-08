import * as React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, Tag, User, Search, ArrowRight, Sparkles, Briefcase, Globe, CheckCircle } from "lucide-react";
import { appwriteBlogService } from "@/services/appwrite.service";
import { mockBlogPosts } from "@/data/mock/blog";
import type { BlogPost } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSenseUnit } from "@/components/adsense-unit";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tranzlo Translation Blog - Industry Trends & AI Translation Insights",
  description: "Stay ahead of the curve with translation industry trends, AI localization tips, and expert guides from the Tranzlo developer and linguist network.",
  keywords: ["translation blog", "AI translation", "machine learning localization", "freelance translation tips"],
};

const CATEGORIES = [
  { id: "all", name: "All Topics" },
  { id: "translation-tech", name: "AI & Translation Tech" },
  { id: "career-growth", name: "Linguist & Career Growth" },
  { id: "industry-trends", name: "Industry Insights & Trends" },
  { id: "best-practices", name: "Best Practices & Guides" },
  { id: "platform-news", name: "Platform News & Updates" },
];

export default async function BlogPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await props.searchParams;
  const activeCategory = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : "all";
  const queryFilter = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  let posts: BlogPost[] = [];
  try {
    posts = await appwriteBlogService.getPosts("published");
  } catch (err) {
    console.error("Error fetching live blog posts for SSR:", err);
  }

  // Fallback to mock data if Appwrite is empty
  if (!posts || posts.length === 0) {
    posts = mockBlogPosts.filter((p) => p.status === "published");
  }

  // Apply filters server-side
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "all" || (post.category && post.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesQuery = queryFilter
      ? post.title.toLowerCase().includes(queryFilter.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(queryFilter.toLowerCase()) ||
        post.content.toLowerCase().includes(queryFilter.toLowerCase())
      : true;
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10 space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            The Tranzlo Chronicle
          </h1>
          <p className="text-lg text-muted-foreground">
            Insights on AI localization, translation standards, and freelance linguist growth.
          </p>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="flex flex-col gap-6 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Input */}
            <form method="GET" className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={queryFilter}
                placeholder="Search translation topics..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {activeCategory !== "all" && <input type="hidden" name="category" value={activeCategory} />}
            </form>

            {/* Category Filter Selector Tabs */}
            <div className="flex flex-wrap gap-2 items-center justify-center lg:justify-end w-full lg:w-auto">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.id}${queryFilter ? `&q=${queryFilter}` : ""}`}
                  className={`px-4 py-2 text-xs rounded-xl border transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-primary/10 border-primary text-primary font-semibold shadow-inner"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Layout (Articles Grid + Sidebar Promotion Widgets) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Articles Section */}
          <div className="lg:col-span-3">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border/50">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-muted-foreground">No articles found</h3>
                <p className="text-muted-foreground text-sm mt-1">Try resetting your filters or search query.</p>
                <Link href="/blog" className="inline-block mt-4 text-xs font-semibold text-primary hover:underline">
                  View all posts
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => {
                  const formattedDate = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Draft";

                  const currentCat = CATEGORIES.find((c) => c.id === post.category) || { name: "General" };

                  return (
                    <Link
                      key={post.$id}
                      href={`/blog/${post.slug}`}
                      className="block group h-full"
                    >
                      <Card
                        className="bg-card/40 hover:bg-card/85 backdrop-blur-sm border-border hover:border-primary/40 transition-all duration-300 flex flex-col h-full overflow-hidden hover:shadow-xl hover:shadow-cyan-950/5 group"
                      >
                        <CardHeader className="p-0 relative h-48 bg-muted overflow-hidden flex items-center justify-center border-b border-border/50">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.imageAlt || `Cover image for ${post.title}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-primary/5 flex items-center justify-center p-6 text-center">
                              <BookOpen className="h-10 w-10 text-primary/30 group-hover:text-primary/50 transition-colors duration-300" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                            <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[10px] uppercase font-bold tracking-wider rounded-md">
                              {currentCat.name}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 space-y-3">
                          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formattedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              5 min read
                            </span>
                          </div>
                          <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </CardDescription>
                        </CardContent>
                        <CardFooter className="px-6 py-4 bg-muted/20 border-t border-border/40 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                            <User className="h-3.5 w-3.5" />
                            By Tranzlo Team
                          </span>
                          <div
                            className="text-xs font-bold text-primary group-hover:text-primary/80 flex items-center gap-1 transition-colors"
                          >
                            Read full article
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service Promotion Sidebar (Connecting Blog to Platform Services) */}
          <aside className="space-y-6 lg:col-span-1">
            {/* Widget 1: Find Translators */}
            <Link href="/search?category=translators" className="block group">
              <Card className="border border-border/80 bg-card/65 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden relative hover:border-primary/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 text-primary/10">
                  <Globe className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                    Looking for a Translator?
                  </CardTitle>
                  <CardDescription className="text-2xs text-muted-foreground">
                    Connect with verified professional translators globally.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Search through our directory of linguistic experts sorted by rating, native language pairs, and specializations.
                  </p>
                  <Button size="sm" className="w-full text-xs py-2 bg-primary text-primary-foreground font-bold hover:bg-primary/95 rounded-xl pointer-events-none">
                    Browse Translators
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Widget 2: Find Companies */}
            <Link href="/companies" className="block group">
              <Card className="border border-border/80 bg-card/65 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden relative hover:border-primary/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 text-teal-500/10">
                  <Briefcase className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                    <Briefcase className="h-4.5 w-4.5 text-teal-400" />
                    Looking for a Company?
                  </CardTitle>
                  <CardDescription className="text-2xs text-muted-foreground">
                    Connect with verified localization agencies & partners.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Search through translation companies, agencies, and enterprise organizations managing global localization.
                  </p>
                  <Button size="sm" variant="outline" className="w-full text-xs py-2 border-border/80 hover:bg-muted font-bold rounded-xl pointer-events-none">
                    Browse Companies
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Google AdSense Unit */}
            <AdSenseUnit slotId="blog_sidebar_ad" />

            {/* Widget 3: Freelancer Opportunities */}
            <Link href="/signup" className="block group">
              <Card className="border border-border/80 bg-card/65 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden relative hover:border-primary/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 text-primary/10">
                  <Briefcase className="h-16 w-16" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                    Are you a Translator?
                  </CardTitle>
                  <CardDescription className="text-2xs text-muted-foreground">
                    Find jobs and scale your localization career.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Register as a linguist on Tranzlo, complete your onboarding, set your pricing, and bid on enterprise translation projects.
                  </p>
                  <Button size="sm" variant="outline" className="w-full text-xs py-2 border-border/80 hover:bg-muted font-bold rounded-xl pointer-events-none">
                    Register as Translator
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Widget 3: Trust Badges / SEO Signals */}
            <Card className="border border-border/80 bg-muted/15 rounded-2xl p-4 space-y-3">
              <h4 className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Tranzlo Localization Network</h4>
              <ul className="space-y-2 text-2xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>100% Verified Translators & Entities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Secure Escrow Payments (PayPal/NFC)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>AI-Assisted Terminology Tools</span>
                </li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
