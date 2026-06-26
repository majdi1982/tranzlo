"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Check,
  Trash2,
  Eye,
  Share2,
  ExternalLink,
  Globe,
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  Loader2,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { getServices } from "@/services";
import type { BlogPost } from "@/types";
import { getAccount } from "@/lib/appwrite";
import { BLOG_CATEGORIES, BLOG_CATEGORY_SLUGS, BLOG_CATEGORY_MAP } from "@/constants/categories";


export default function AdminBlogReviewPage() {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Comments state
  const [comments, setComments] = React.useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = React.useState(false);

  // AI Generator state
  const [competitorUrl, setCompetitorUrl] = React.useState("");
  const [targetCategory, setTargetCategory] = React.useState("general");
  const [generating, setGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState("Generate AI Article Draft");

  async function handleGenerate() {
    if (!competitorUrl.trim()) return;
    setGenerating(true);
    setGenerationStep("Scraping competitor article...");
    try {
      // Step feedback timeouts
      const t1 = setTimeout(() => setGenerationStep("Analyzing SEO & generating article..."), 2000);
      const t2 = setTimeout(() => setGenerationStep("Generating featured cover image..."), 10000);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const account = getAccount();
        const jwtObj = await account.createJWT();
        if (jwtObj?.jwt) {
          headers["Authorization"] = `Bearer ${jwtObj.jwt}`;
        }
      } catch (jwtErr) {
        console.warn("Failed to generate JWT for AI blog generation:", jwtErr);
      }

      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ competitorUrl, category: targetCategory }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      toast({
        title: "AI Draft Generated! ✨",
        description: "Competitor article was analyzed and optimized. Review the draft below.",
      });

      setCompetitorUrl("");
      loadPendingPosts();
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err.message || "An unexpected error occurred during draft generation.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setGenerationStep("Generate AI Article Draft");
    }
  }

  React.useEffect(() => {
    loadPendingPosts();
    loadPendingComments();
  }, []);

  async function loadPendingComments() {
    setCommentsLoading(true);
    try {
      const services = getServices();
      const allComments = await services.blog.getAllCommentsForAdmin("pending");
      setComments(allComments);
    } catch (err) {
      console.error("Error loading pending comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleApproveComment(commentId: string) {
    try {
      const services = getServices();
      await services.blog.updateCommentStatus(commentId, "approved");
      setComments(prev => prev.filter(c => c.$id !== commentId));
      toast({ title: "Comment Approved" });
    } catch (err: any) {
      toast({ title: "Failed to approve comment", variant: "destructive" });
    }
  }

  async function handleRejectComment(commentId: string) {
    try {
      const services = getServices();
      await services.blog.updateCommentStatus(commentId, "rejected");
      setComments(prev => prev.filter(c => c.$id !== commentId));
      toast({ title: "Comment Rejected" });
    } catch (err: any) {
      toast({ title: "Failed to reject comment", variant: "destructive" });
    }
  }

  async function loadPendingPosts() {
    setLoading(true);
    try {
      const services = getServices();
      const pending = await services.blog.getPosts("pending_review");
      setPosts(pending);
    } catch (err: any) {
      toast({
        title: "Error loading articles",
        description: err.message || "An error occurred while loading pending articles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(postId: string) {
    setActionLoading(postId);
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
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Publishing failed.");
      }

      toast({
        title: "Approved & Published! 🚀",
        description: `Article "${data.post.title}" was successfully published and shared to Facebook and LinkedIn.`,
      });

      // Remove from list
      setPosts((prev) => prev.filter((p) => p.$id !== postId));
      if (selectedPost?.$id === postId) {
        setPreviewOpen(false);
        setSelectedPost(null);
      }
    } catch (err: any) {
      toast({
        title: "Publishing failed",
        description: err.message || "An unexpected error occurred during publishing.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(postId: string) {
    if (!confirm("Are you sure you want to reject and delete this article?")) return;

    setActionLoading(postId);
    try {
      const services = getServices();
      await services.blog.deletePost(postId);

      toast({
        title: "Article Rejected & Deleted 🗑️",
        description: "The article has been successfully removed from the review list.",
      });

      setPosts((prev) => prev.filter((p) => p.$id !== postId));
      if (selectedPost?.$id === postId) {
        setPreviewOpen(false);
        setSelectedPost(null);
      }
    } catch (err: any) {
      toast({
        title: "Deletion failed",
        description: err.message || "An unexpected error occurred during deletion.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["admin"]}>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                Blog Review
              </h1>
              <p className="text-muted-foreground text-sm">
                Review and approve automatically generated articles to publish on the blog and share across social media channels.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadPendingPosts}
              disabled={loading}
              className="self-start md:self-auto hover:bg-primary/5 transition-all"
            >
              Refresh List
            </Button>
          </div>

          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList className="bg-primary/5 p-1 rounded-xl">
              <TabsTrigger value="articles" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4 mr-2" />
                AI Articles Review
              </TabsTrigger>
              <TabsTrigger value="comments" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comments Moderation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-6">
              {/* Integration Details Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">🔗 Connected Social Publishing Channels:</p>
                <p>When you click <strong>"Approve & Publish"</strong>, the article goes live on Tranzlo and automatically publishes to:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">Facebook (tranzlo2)</Badge>
                  <Badge variant="secondary">X / Twitter (tranzlo2)</Badge>
                  <Badge variant="secondary">LinkedIn (tranzlo)</Badge>
                  <Badge variant="secondary">Pinterest (tranzlo)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Blog Draft Generator */}
          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                <Sparkles className="h-5 w-5 animate-pulse text-primary" />
                AI Blog Draft Generator
              </CardTitle>
              <CardDescription className="text-xs">
                Enter a competitor's article URL to automatically scrape, perform SEO keyword analysis, generate an optimized English article, and paint a featured cover image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wide block">Competitor Article URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/blog/competitor-post"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    disabled={generating}
                  />
                </div>
                <div className="w-full sm:w-[200px] space-y-1.5">
                  <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wide block">Target Category</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                    disabled={generating}
                  >
                    {Object.entries(BLOG_CATEGORIES).map(([slug, name]) => (
                      <option key={slug} value={slug}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || !competitorUrl.trim()}
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 text-white shadow-sm font-semibold h-9 rounded-lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {generationStep}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate AI Article Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Main List */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Pending Articles ({posts.length})
              </CardTitle>
              <CardDescription>
                Please review SEO quality, image alt text, and layout structure before approving publication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Check className="h-10 w-10 text-emerald-500 mx-auto rounded-full bg-emerald-500/10 p-2" />
                  <p className="text-sm font-medium text-muted-foreground">Excellent work! There are no pending articles to review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.$id}
                      className="group relative flex flex-col md:flex-row items-start md:items-center justify-between rounded-xl border border-border/60 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-muted/30"
                    >
                      <div className="space-y-2 max-w-2xl min-w-0">
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold">
                            Domain: {post.category || "General"}
                          </Badge>
                          {post.tags?.filter(t => t.startsWith("Objective:")).map((tag) => (
                            <Badge key={tag} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-2xs font-semibold">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags?.filter(t => !t.startsWith("Objective:")).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-2xs font-normal">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>

                        {/* SEO Info Row */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {post.wordCount && (
                            <span className="text-2xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                              📝 {post.wordCount} words
                            </span>
                          )}
                          {post.readingTime && (
                            <span className="text-2xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                              ⏱ {post.readingTime} min read
                            </span>
                          )}
                          {post.primaryKeyword && (
                            <span className="text-2xs text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                              🔑 {post.primaryKeyword}
                            </span>
                          )}
                          {post.generatedBy && (
                            <span className="text-2xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                              🤖 {post.generatedBy}
                            </span>
                          )}
                        </div>
                        {post.imageAlt && (
                          <div className="text-2xs text-muted-foreground flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-md w-fit">
                            <Globe className="h-3 w-3 text-primary" />
                            <span className="font-semibold text-foreground shrink-0">Image Alt Text:</span>
                            <span className="italic truncate max-w-sm">{post.imageAlt}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0 w-full md:w-auto justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(`/dashboard/admin/blog-review/preview?id=${post.$id}`, "_blank");
                          }}
                          className="gap-1.5 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview Layout
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actionLoading === post.$id}
                          onClick={() => handleReject(post.$id)}
                          className="gap-1.5 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>

                        <Button
                          variant="default"
                          size="sm"
                          disabled={actionLoading === post.$id}
                          onClick={() => handleApprove(post.$id)}
                          className="gap-1.5 text-xs bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 text-white shadow-sm"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Approve & Publish
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview & Edit Modal */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Preview Content & SEO Structure
                </DialogTitle>
                <DialogDescription>
                  Verify headings, word count, and Alt descriptors before approval.
                </DialogDescription>
              </DialogHeader>

              {selectedPost && (
                <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
                  {/* Title & Stats */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Domain: {selectedPost.category}</Badge>
                      {selectedPost.tags?.filter(t => t.startsWith("Objective:")).map((t) => (
                        <Badge key={t} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold">{t}</Badge>
                      ))}
                      {selectedPost.tags?.filter(t => !t.startsWith("Objective:")).map((t) => (
                        <Badge key={t} variant="outline">#{t}</Badge>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{selectedPost.title}</h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                      {selectedPost.wordCount && <span>📝 {selectedPost.wordCount} words</span>}
                      {selectedPost.readingTime && <span>⏱ {selectedPost.readingTime} min</span>}
                      {selectedPost.primaryKeyword && <span>🔑 {selectedPost.primaryKeyword}</span>}
                      <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Author: Automated Bot</span>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1 bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <p className="text-2xs uppercase tracking-wide text-primary font-bold">Excerpt (Snippet):</p>
                    <p className="text-xs text-foreground leading-relaxed font-medium">{selectedPost.excerpt}</p>
                  </div>

                  {/* Cover Image Alt Text detail */}
                  {selectedPost.imageAlt && (
                    <div className="space-y-1 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                      <p className="text-2xs uppercase tracking-wide text-amber-600 font-bold">Cover Image Alt Text (SEO):</p>
                      <p className="text-xs text-foreground leading-relaxed italic">{selectedPost.imageAlt}</p>
                    </div>
                  )}

                  {/* Full Article Content */}
                  <div className="space-y-2 border-t pt-4">
                    <p className="text-2xs uppercase tracking-wide text-muted-foreground font-bold mb-2">Full Article Content (Markdown):</p>
                    <div className="rounded-lg border bg-muted/20 p-4 text-sm font-sans leading-relaxed whitespace-pre-wrap max-h-[35vh] overflow-y-auto">
                      {selectedPost.content}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4 border-t flex items-center justify-between gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  {selectedPost && (
                    <>
                      <Button
                        variant="destructive"
                        disabled={actionLoading === selectedPost.$id}
                        onClick={() => handleReject(selectedPost.$id)}
                      >
                        Reject & Delete
                      </Button>
                      <Button
                        variant="default"
                        disabled={actionLoading === selectedPost.$id}
                        onClick={() => handleApprove(selectedPost.$id)}
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 text-white"
                      >
                        Approve, Publish & Share
                      </Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Pending Comments
                  </CardTitle>
                  <CardDescription>
                    Review user comments before they appear on the blog.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {commentsLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl border-border/50">
                      <Check className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-semibold text-foreground">No pending comments.</p>
                      <p className="text-sm mt-1">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map(comment => (
                        <div key={comment.$id} className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">on {new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground bg-card p-3 rounded-lg border border-border/30 mt-2">
                              {comment.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 md:flex-col">
                            <Button size="sm" onClick={() => handleApproveComment(comment.$id)} className="w-full md:w-32 bg-green-500 hover:bg-green-600 text-white gap-2">
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" onClick={() => handleRejectComment(comment.$id)} variant="destructive" className="w-full md:w-32 gap-2">
                              <Trash2 className="h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
