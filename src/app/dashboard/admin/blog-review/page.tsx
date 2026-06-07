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
  Info
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
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { getServices } from "@/services";
import type { BlogPost } from "@/types";

export default function AdminBlogReviewPage() {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadPendingPosts();
  }, []);

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
      const services = getServices();
      const approvedPost = await services.blog.publishPost(postId);
      
      toast({
        title: "Approved & Published! 🚀",
        description: `Article "${approvedPost.title}" was successfully published and shared to Facebook, LinkedIn, X, and Pinterest.`,
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
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {post.category || "General"}
                        </Badge>
                        {post.tags?.map((tag) => (
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
                      
                      {/* SEO Image Alt Info */}
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
                          setSelectedPost(post);
                          setPreviewOpen(true);
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
                    <Badge variant="default">{selectedPost.category}</Badge>
                    {selectedPost.tags?.map((t) => (
                      <Badge key={t} variant="outline">#{t}</Badge>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedPost.title}</h2>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Created At: {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
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
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
