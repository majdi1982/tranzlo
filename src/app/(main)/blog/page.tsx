import * as React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, Tag, User, Search, ArrowRight } from "lucide-react";
import { appwriteBlogService } from "@/services/appwrite.service";
import { mockBlogPosts } from "@/data/mock/blog";
import type { BlogPost } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tranzlo Translation Blog - Industry Trends & AI Translation Insights",
  description: "Stay ahead of the curve with translation industry trends, AI localization tips, and expert guides from the Tranzlo developer and linguist network.",
  keywords: ["translation blog", "AI translation", "machine learning localization", "freelance translation tips"],
};

export default async function BlogPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await props.searchParams;
  const tagFilter = typeof resolvedSearchParams.tag === "string" ? resolvedSearchParams.tag : "";
  const queryFilter = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  let posts: BlogPost[] = [];
  try {
    // Attempt to load live published blog posts from Appwrite
    posts = await appwriteBlogService.getPosts("published");
  } catch (err) {
    console.error("Error fetching live blog posts for SSR:", err);
  }

  // Fallback to mock data if Appwrite is empty or errored
  if (!posts || posts.length === 0) {
    posts = mockBlogPosts.filter((p) => p.status === "published");
  }

  // Apply filters server-side
  const filteredPosts = posts.filter((post) => {
    const matchesTag = tagFilter ? post.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase()) : true;
    const matchesQuery = queryFilter
      ? post.title.toLowerCase().includes(queryFilter.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(queryFilter.toLowerCase()) ||
        post.content.toLowerCase().includes(queryFilter.toLowerCase())
      : true;
    return matchesTag && matchesQuery;
  });

  // Extract all unique tags for filter display
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      {/* Premium background radial glow for immersive visual hierarchy */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10 space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            The Tranzlo Chronicle
          </h1>
          <p className="text-lg text-slate-400">
            Insights on AI localization, translation standards, and freelance linguist growth.
          </p>
        </div>

        {/* Search & Tags Sidebar Filter Block */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800">
          <form method="GET" className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={queryFilter}
              placeholder="Search translation topics..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
          </form>

          {/* Quick Tags Scroll area */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider mr-2">Popular tags:</span>
            <Link
              href="/blog"
              className={`px-3 py-1 text-2xs rounded-full border transition-all duration-300 ${
                !tagFilter
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-semibold"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </Link>
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}${queryFilter ? `&q=${queryFilter}` : ""}`}
                className={`px-3 py-1 text-2xs rounded-full border transition-all duration-300 ${
                  tagFilter === tag
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-semibold"
                    : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Articles Grid list */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-800/50">
            <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-400">No articles found</h3>
            <p className="text-slate-500 text-sm mt-1">Try resetting your filters or search query.</p>
            <Link href="/blog" className="inline-block mt-4 text-xs font-semibold text-cyan-400 hover:underline">
              View all posts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => {
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Draft";

              return (
                <Card
                  key={post.$id}
                  className="bg-slate-900/40 hover:bg-slate-900/80 backdrop-blur-sm border-slate-800/80 hover:border-cyan-500/30 transition-all duration-300 flex flex-col h-full overflow-hidden hover:shadow-xl hover:shadow-cyan-950/20 group"
                >
                  <CardHeader className="p-0 relative h-48 bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800/50">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 flex items-center justify-center p-6 text-center">
                        <BookOpen className="h-10 w-10 text-cyan-500/30 group-hover:text-cyan-500/50 transition-colors duration-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                      {post.tags?.slice(0, 2).map((t) => (
                        <Badge key={t} className="bg-slate-900/90 text-cyan-400 border border-slate-800 text-[10px] uppercase font-bold tracking-wider">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6 space-y-3">
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        5 min read
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="px-6 py-4 bg-slate-950/30 border-t border-slate-800/30 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <User className="h-3.5 w-3.5" />
                      By Tranzlo Team
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      Read full article
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
