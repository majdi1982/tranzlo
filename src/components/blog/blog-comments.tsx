"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, MessageSquare, Send, Trash2, LogIn } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { appwriteBlogService } from "@/services/appwrite.service";
import type { BlogComment } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogCommentsProps {
  postId: string;
  initialLikes?: string[];
  initialComments?: BlogComment[];
}

export function BlogComments({ postId, initialLikes = [], initialComments = [] }: BlogCommentsProps) {
  const { user } = useSession();
  const [likes, setLikes] = React.useState<string[]>(initialLikes);
  const [comments, setComments] = React.useState<BlogComment[]>(initialComments);
  const [newComment, setNewComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [liking, setLiking] = React.useState(false);

  const isLiked = user ? likes.includes(user.$id) : false;

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const updatedLikes = await appwriteBlogService.toggleLike(postId, user.$id);
      setLikes(updatedLikes);
    } catch (err) {
      console.error("Failed to toggle like:", err);
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const addedComment = await appwriteBlogService.createComment(
        postId,
        user.$id,
        user.name,
        newComment.trim()
      );
      setComments((prev) => [addedComment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await appwriteBlogService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.$id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const formatCommentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 mt-12 border-t border-border/80 pt-10">
      {/* Interaction Summary Header */}
      <div className="flex items-center gap-6 pb-4 border-b border-border/40">
        <button
          onClick={handleLike}
          disabled={!user}
          className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
            user
              ? "hover:text-red-500 cursor-pointer active:scale-95"
              : "opacity-60 cursor-not-allowed"
          } ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
          title={user ? "Like this post" : "Log in to like this post"}
        >
          <Heart className={`h-5 w-5 transition-transform duration-300 ${isLiked ? "fill-current scale-110" : ""}`} />
          <span>{likes.length} {likes.length === 1 ? "Like" : "Likes"}</span>
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <MessageSquare className="h-5 w-5" />
          <span>{comments.length} {comments.length === 1 ? "Comment" : "Comments"}</span>
        </div>
      </div>

      {/* Write Comment Section */}
      <div className="space-y-4">
        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                  {user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your thoughts on this post..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-card/20 backdrop-blur-sm border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-2xl resize-none min-h-[90px] text-sm p-4"
                  maxLength={1000}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/95 font-semibold text-xs px-5 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gradient-to-r from-primary/5 via-card/40 to-primary/5 backdrop-blur-md border border-border/60 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Join the conversation</h4>
              <p className="text-xs text-muted-foreground">Sign in to share your thoughts and like this article.</p>
            </div>
            <Link href="/login">
              <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-5 py-2 text-xs font-bold flex items-center gap-2 transition-all">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-5">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isOwner = user ? comment.userId === user.$id : false;
            return (
              <div
                key={comment.$id}
                className="flex gap-4 p-4 rounded-2xl bg-card/10 backdrop-blur-2xs border border-border/30 hover:border-border/60 transition-all duration-300 group"
              >
                <Avatar className="h-9 w-9 border border-border/40">
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold text-2xs uppercase">
                    {comment.userName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground block sm:inline-block mr-2">
                        {comment.userName}
                      </span>
                      <span className="text-3xs text-muted-foreground">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment.$id)}
                        className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-25" />
            <p className="text-xs">No comments yet. Be the first to start the discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
}
