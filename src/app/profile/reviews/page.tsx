"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Star, User, Lock } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Rating } from "@/types";

export function ReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId") || "";
  const { user } = useSession();
  const services = getServices();

  const [loading, setLoading] = React.useState(true);
  const [profileName, setProfileName] = React.useState("User");
  const [ratings, setRatings] = React.useState<Rating[]>([]);
  const [avgRating, setAvgRating] = React.useState(0);
  const [reviewerNames, setReviewerNames] = React.useState<Record<string, string>>({});

  const isLoggedIn = !!user;

  React.useEffect(() => {
    async function loadData() {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        // Load target profile name
        const trans = await services.profile.getTranslatorProfile(targetUserId);
        if (trans) {
          setProfileName(trans.fullName || "Translator");
        } else {
          const comp = await services.profile.getCompanyProfile(targetUserId);
          if (comp) {
            setProfileName(comp.companyName || "Company");
          }
        }

        // Load ratings
        const allRatings = await services.rating.getRatings(targetUserId);
        setRatings(allRatings || []);
        
        const avg = await services.rating.getAverageRating(targetUserId);
        setAvgRating(avg || 0);

        // If logged in, fetch reviewer names for details
        if (user && allRatings && allRatings.length > 0) {
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
        console.error("Failed to load review details", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [targetUserId, user]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-12 pb-16 px-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-xl bg-background/50 backdrop-blur-md border-border/40 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground/95">Reviews for {profileName}</h1>
          <p className="text-xs text-muted-foreground">Detailed history of client and translator feedback</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="glass-card border-border/40 rounded-2xl bg-gradient-to-br from-background/30 to-accent/5 p-6 flex items-center justify-between">
            <div>
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Rating</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 5.0</span>
              </div>
              <div className="flex items-center text-amber-500 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-current" : ""}`} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider">Total Reviews</span>
              <p className="text-2xl font-bold mt-1 text-foreground">{ratings.length}</p>
              <p className="text-4xs text-muted-foreground">Verified users feedback</p>
            </div>
          </Card>

          {/* Guest vs Logged-In View Content */}
          {isLoggedIn ? (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground/80 px-1">Detailed Feedback List</h2>
              {ratings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-2xl">
                  No reviews submitted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {ratings.map((r) => (
                    <Card key={r.$id} className="border-border/40 rounded-2xl p-5 hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-foreground">
                              {reviewerNames[r.fromUserId] || "Verified Client"}
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
                      <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                        {r.reviewText || "No text description provided."}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card className="border-border/40 rounded-2xl p-8 text-center bg-accent/5 space-y-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Detailed Feedback is Protected</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  To protect the privacy of our translators and companies, full review details, reviewer identities, and texts are only visible to logged-in members.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button size="sm" onClick={() => router.push("/login")} className="rounded-xl text-xs font-semibold px-5">
                  Log In
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push("/register")} className="rounded-xl text-xs font-semibold px-5">
                  Sign Up
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ReviewsContent />
    </React.Suspense>
  );
}
