"use client";

import * as React from "react";
import { Star, User, Loader2, AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Rating } from "@/types";

export default function DashboardRatingsPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const services = getServices();

  const [loading, setLoading] = React.useState(true);
  const [ratings, setRatings] = React.useState<Rating[]>([]);
  const [avgRating, setAvgRating] = React.useState(0);
  const [reviewerNames, setReviewerNames] = React.useState<Record<string, string>>({});

  // Dispute state
  const [disputingRating, setDisputingRating] = React.useState<Rating | null>(null);
  const [disputeReason, setDisputeReason] = React.useState("");
  const [submittingDispute, setSubmittingDispute] = React.useState(false);

  async function loadData() {
    if (!user?.$id) return;
    try {
      const allRatings = await services.rating.getRatings(user.$id);
      setRatings(allRatings || []);

      const avg = await services.rating.getAverageRating(user.$id);
      setAvgRating(avg || 0);

      // Fetch names for reviewers
      if (allRatings && allRatings.length > 0) {
        const namesMap: Record<string, string> = {};
        await Promise.all(
          allRatings.map(async (r) => {
            try {
              const trProf = await services.profile.getTranslatorProfile(r.fromUserId);
              if (trProf) {
                namesMap[r.fromUserId] = trProf.fullName;
                return;
              }
              const coProf = await services.profile.getCompanyProfile(r.fromUserId);
              if (coProf) {
                namesMap[r.fromUserId] = coProf.companyName;
              }
            } catch {
              // ignore
            }
          })
        );
        setReviewerNames(namesMap);
      }
    } catch (e) {
      console.error("Failed to load ratings", e);
      toast({ title: "Failed to load ratings list", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, [user?.$id]);

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingRating || !user?.$id) return;
    if (!disputeReason || disputeReason.trim().length < 10) {
      toast({
        title: "Reason Required",
        description: "Please explain the reason for the dispute (minimum 10 characters).",
        variant: "destructive",
      });
      return;
    }

    setSubmittingDispute(true);
    try {
      await services.complaint.create({
        userId: user.$id,
        subject: `[Rating Dispute] Rating ID: ${disputingRating.$id}`,
        description: `Dispute Reason:\n${disputeReason.trim()}\n\n---\nRating Stars: ${disputingRating.stars}\nRating text: "${disputingRating.reviewText || "No text"}"`,
      });

      toast({
        title: "Dispute Submitted",
        description: "Your objection has been filed and will be reviewed by the admin.",
        variant: "success",
      });

      setDisputingRating(null);
      setDisputeReason("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Objection Failed",
        description: "Failed to submit dispute. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmittingDispute(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ratings & Feedback</h1>
        <p className="text-sm text-muted-foreground">Manage your received feedback and handle disputes.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Summary */}
          <div className="space-y-6 md:col-span-1">
            <Card className="glass-card border-border/40 rounded-2xl bg-gradient-to-br from-background/30 to-accent/5 p-6">
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider">Average Rating</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 5.0</span>
              </div>
              <div className="flex items-center text-amber-500 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(avgRating) ? "fill-current" : ""}`} />
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/20">
                <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Total Count</span>
                <span className="text-lg font-bold text-foreground">{ratings.length} Reviews</span>
              </div>
            </Card>
          </div>

          {/* List */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-foreground/80 px-1">Recent Feedback</h2>
            {ratings.length === 0 ? (
              <p className="text-xs text-muted-foreground py-12 text-center border border-dashed border-border/50 rounded-2xl">
                No feedback ratings received yet.
              </p>
            ) : (
              <div className="space-y-3.5">
                {ratings.map((r) => (
                  <Card key={r.$id} className="border-border/40 rounded-2xl p-5 hover:border-primary/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-foreground">
                              {reviewerNames[r.fromUserId] || "Verified Partner"}
                            </span>
                            <span className="text-4xs text-muted-foreground font-medium">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-500 gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < r.stars ? "fill-current" : ""}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4 pl-1">
                        {r.reviewText || "No review text details provided."}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border/10">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-4xs hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                        onClick={() => setDisputingRating(r)}
                      >
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Dispute Rating
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Objections/Disputes Dialog Modal */}
      {disputingRating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border/40 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="bg-gradient-to-br from-background/30 to-accent/5 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Objection to Rating
              </CardTitle>
              <CardDescription className="text-3xs text-muted-foreground">
                Explain why you believe this review is invalid or violates guidelines. Admin will investigate.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleDisputeSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="bg-muted/30 border border-border/50 rounded-xl p-3 text-3xs space-y-1">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Stars: {disputingRating.stars}/5</span>
                    <span>{new Date(disputingRating.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted-foreground italic truncate">
                    "{disputingRating.reviewText || "No comment content."}"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="disputeReason" className="text-xs font-semibold text-foreground">
                    Reason for Objection
                  </label>
                  <Textarea
                    id="disputeReason"
                    placeholder="Provide details why this rating should be investigated or removed..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="min-h-[120px] text-xs rounded-xl"
                    required
                  />
                </div>
              </CardContent>
              <div className="p-4 bg-muted/20 border-t border-border/10 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={() => {
                    setDisputingRating(null);
                    setDisputeReason("");
                  }}
                  disabled={submittingDispute}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl text-xs"
                  disabled={submittingDispute}
                >
                  {submittingDispute ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Dispute"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
