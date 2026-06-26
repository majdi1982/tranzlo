"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Tag, User, ArrowLeft, Share2, Sparkles, Globe } from "lucide-react";
import { getServices } from "@/services";
import type { BlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { useToast } from "@/hooks/use-toast";
import { getAccount } from "@/lib/appwrite";

export default function AdminBlogPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const id = searchParams.get("id");

  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    if (!id) {
      toast({ title: "Invalid Post ID", variant: "destructive" });
      router.push("/dashboard/admin/blog-review");
      return;
    }
    loadPost();
  }, [id]);

  async function loadPost() {
    setLoading(true);
    try {
      const services = getServices();
      const pending = await services.blog.getPosts("pending_review");
      const found = pending.find((p) => p.$id === id);
      if (found) {
        setPost(found);
      } else {
        toast({ title: "Post not found or already published", variant: "destructive" });
        router.push("/dashboard/admin/blog-review");
      }
    } catch (err: any) {
      toast({ title: "Error loading draft", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!post) return;
    setActionLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const account = getAccount();
        const jwtObj = await account.createJWT();
        if (jwtObj?.jwt) {
          headers["Authorization"] = `Bearer ${jwtObj.jwt}`;
        }
      } catch (jwtErr) {
        console.warn("Failed to generate JWT for publishing:", jwtErr);
      }

      const res = await fetch("/api/blog/publish", {
        method: "POST",
        headers,
        body: JSON.stringify({ postId: post.$id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Publishing failed.");
      }
      
      toast({
        title: "Approved & Published! 🚀",
        description: `Article "${post.title}" is now live and shared to Facebook and LinkedIn.`,
      });
      router.push("/dashboard/admin/blog-review");
    } catch (err: any) {
      toast({ title: "Publishing failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!post) return;
    if (!confirm("Are you sure you want to reject and delete this article?")) return;
    setActionLoading(true);
    try {
      const services = getServices();
      await services.blog.deletePost(post.$id);
      toast({
        title: "Article Rejected & Deleted 🗑️",
      });
      router.push("/dashboard/admin/blog-review");
    } catch (err: any) {
      toast({ title: "Deletion failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["admin"]}>
        <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
          <div className="relative max-w-4xl mx-auto z-10 space-y-8">
            
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between border-b pb-4">
              <Link
                href="/dashboard/admin/blog-review"
                className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Review List
              </Link>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold uppercase tracking-wider text-xs">
                  Pending Review (Preview Mode)
                </Badge>
              </div>
            </div>

            {/* Quick Actions Sticky Panel */}
            <div className="sticky top-4 bg-card/90 backdrop-blur-md border border-primary/20 p-4 rounded-2xl flex items-center justify-between shadow-lg z-50">
              <div className="text-xs text-muted-foreground hidden sm:block">
                <p className="font-semibold text-foreground">Draft Review Actions</p>
                <p>Verify layouts, tags, and media descriptions before making public.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  variant="destructive"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="px-5"
                >
                  Reject & Delete
                </Button>
                <Button
                  variant="default"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 text-white px-6 shadow-md"
                >
                  Approve, Publish & Share
                </Button>
              </div>
            </div>

            {/* Article Container Card */}
            <article className="bg-card/40 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Article Cover Image Spot */}
              <div className="h-[300px] sm:h-[400px] bg-muted relative flex items-center justify-center border-b border-border">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.imageAlt || `Cover image for: ${post.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-primary/5 flex items-center justify-center p-6 text-center">
                    <Share2 className="h-16 w-16 text-primary/20" />
                  </div>
                )}
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                  <span className="bg-background/90 text-primary border border-border px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                    Domain: {post.category || "General"}
                  </span>
                  {post.tags?.map((t) => (
                    <span
                      key={t}
                      className="bg-background/90 text-muted-foreground border border-border px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-8">
                {/* Metadata Bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border pb-6">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary/70" />
                    Automated Publisher Bot
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary/70" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary/70" />
                    Pending Review
                  </span>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5 bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <p className="text-2xs uppercase tracking-wide text-primary font-bold">Generated Snippet / Excerpt</p>
                  <p className="text-sm text-foreground leading-relaxed italic">{post.excerpt}</p>
                </div>

                {/* Cover Image Alt Text detail */}
                {post.imageAlt && (
                  <div className="space-y-1.5 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                    <p className="text-2xs uppercase tracking-wide text-amber-600 font-bold">SEO Image Alt Text Description</p>
                    <p className="text-sm text-foreground leading-relaxed italic">{post.imageAlt}</p>
                  </div>
                )}

                {/* Article Headline */}
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  {post.title}
                </h1>

                {/* Structured Content Area for perfect rendering preview */}
                <div className="prose prose-invert prose-cyan max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed space-y-6">
                  {post.content.split("\n\n").map((paragraph, index) => {
                    if (paragraph.startsWith("## ")) {
                      return (
                        <h2 key={index} className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4 border-l-2 border-primary pl-3">
                          {paragraph.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith("### ")) {
                      return (
                        <h3 key={index} className="text-lg font-bold text-foreground mt-6 mb-3">
                          {paragraph.replace("### ", "")}
                        </h3>
                      );
                    }
                    return (
                      <p key={index} className="whitespace-pre-line text-muted-foreground">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </article>

          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
