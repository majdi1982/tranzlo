"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Ticket, CheckCircle, XCircle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface PromoCode {
  $id: string;
  code: string;
  planTier: string;
  durationMonths: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  discountType?: string;
  discountPercent?: number;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = React.useState<PromoCode[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [code, setCode] = React.useState("");
  const [planTier, setPlanTier] = React.useState("pro");
  const [durationMonths, setDurationMonths] = React.useState("3");
  const [maxUses, setMaxUses] = React.useState("100");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [discountType, setDiscountType] = React.useState("free");
  const [discountPercent, setDiscountPercent] = React.useState("100");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchPromoCodes = async () => {
    try {
      const db = (await import("@/lib/appwrite")).getDatabases();
      const { DB_ID, COLLECTIONS } = await import("@/lib/appwrite");
      const result = await db.listDocuments(DB_ID, COLLECTIONS.promoCodes);
      setPromoCodes(result.documents as unknown as PromoCode[]);
    } catch (err: any) {
      console.error("Failed to fetch promo codes:", err);
      toast({ title: "Failed to load promo codes", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    try {
      const db = (await import("@/lib/appwrite")).getDatabases();
      const { DB_ID, COLLECTIONS, ID } = await import("@/lib/appwrite");

      const payload = {
        code: code.trim().toUpperCase(),
        planTier,
        durationMonths: parseInt(durationMonths),
        maxUses: parseInt(maxUses),
        usedCount: 0,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        discountType,
        discountPercent: parseInt(discountPercent),
      };

      await db.createDocument(DB_ID, COLLECTIONS.promoCodes, ID.unique(), payload);
      toast({ title: "Promo code created", description: `Successfully created code ${payload.code}`, variant: "success" });
      
      // Reset form
      setCode("");
      setExpiresAt("");
      
      // Refresh list
      fetchPromoCodes();
    } catch (err: any) {
      toast({ title: "Creation failed", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code? This action cannot be undone.")) return;

    try {
      const db = (await import("@/lib/appwrite")).getDatabases();
      const { DB_ID, COLLECTIONS } = await import("@/lib/appwrite");
      await db.deleteDocument(DB_ID, COLLECTIONS.promoCodes, id);
      toast({ title: "Promo code deleted", variant: "success" });
      fetchPromoCodes();
    } catch (err: any) {
      toast({ title: "Deletion failed", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const db = (await import("@/lib/appwrite")).getDatabases();
      const { DB_ID, COLLECTIONS } = await import("@/lib/appwrite");
      await db.updateDocument(DB_ID, COLLECTIONS.promoCodes, promo.$id, {
        isActive: !promo.isActive
      });
      toast({ title: `Promo code ${!promo.isActive ? "activated" : "deactivated"}`, variant: "success" });
      fetchPromoCodes();
    } catch (err: any) {
      toast({ title: "Operation failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 pt-8 animate-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 border border-border/40">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Promo Code Generator
          </h1>
          <p className="text-muted-foreground text-sm">
            Generate and manage launcher coupons to give users free Pro/Plus subscription months.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Code Form */}
        <div className="md:col-span-1">
          <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg sticky top-20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Generate Coupon
              </CardTitle>
              <CardDescription className="text-3xs">Create new internal discount codes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePromo} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Coupon Code</Label>
                  <Input
                    id="code"
                    type="text"
                    required
                    placeholder="e.g. LAUNCH3FREE"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tier" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Plan Tier</Label>
                  <Select value={planTier} onValueChange={setPlanTier}>
                    <SelectTrigger className="h-9 text-2xs bg-background border-border/50 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground rounded-lg">
                      <SelectItem value="pro" className="text-2xs font-medium">Pro Membership</SelectItem>
                      <SelectItem value="plus" className="text-2xs font-medium">Plus Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="discountType" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Discount Type</Label>
                  <Select value={discountType} onValueChange={(val) => {
                    setDiscountType(val);
                    if (val === "free") setDiscountPercent("100");
                  }}>
                    <SelectTrigger className="h-9 text-2xs bg-background border-border/50 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground rounded-lg">
                      <SelectItem value="free" className="text-2xs font-medium">Free Access (100% Off)</SelectItem>
                      <SelectItem value="percentage" className="text-2xs font-medium">Percentage Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {discountType === "percentage" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="discountPercent" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Discount Percentage (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="duration" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Duration (Months)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="12"
                      required
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                      className="h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="maxUses" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    required
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expiry" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Expiration Date (Optional)</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0"
                  />
                </div>

                <Button type="submit" className="w-full h-9 rounded-lg bg-primary hover:bg-primary/95 text-2xs font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                  Create Coupon Code
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Coupon Code List */}
        <div className="md:col-span-2">
          <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Active Launcher Coupons</CardTitle>
              <CardDescription className="text-3xs">List of internal promo codes in the database.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : promoCodes.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border/50 rounded-xl">
                  <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No promo codes generated yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {promoCodes.map((p) => {
                    const isExpired = p.expiresAt ? new Date(p.expiresAt).getTime() < Date.now() : false;
                    const isFullyUsed = p.usedCount >= p.maxUses;
                    const isCodeValid = p.isActive && !isExpired && !isFullyUsed;

                    return (
                      <div key={p.$id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/40 hover:bg-background/80 transition-all">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground font-mono">{p.code}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded bg-muted">
                              {p.planTier.toUpperCase()} • {p.discountType === "percentage" ? `${p.discountPercent}% Off` : `${p.durationMonths}m Free`}
                            </span>
                            {isCodeValid ? (
                              <span className="text-emerald-500 border border-emerald-500/20 bg-emerald-500/10 text-[8px] h-3.5 py-0 px-1.5 font-bold rounded flex items-center gap-1 shrink-0">
                                <CheckCircle className="h-2.5 w-2.5" /> Active
                              </span>
                            ) : (
                              <span className="text-rose-500 border border-rose-500/20 bg-rose-500/10 text-[8px] h-3.5 py-0 px-1.5 font-bold rounded flex items-center gap-1 shrink-0">
                                <XCircle className="h-2.5 w-2.5" /> {isExpired ? "Expired" : isFullyUsed ? "Max Uses" : "Disabled"}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-3xs text-muted-foreground">
                            <span>Redemptions: **{p.usedCount} / {p.maxUses}**</span>
                            {p.expiresAt && (
                              <span>Expires: {new Date(p.expiresAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(p)}
                            className="h-8 text-3xs rounded-lg font-bold"
                          >
                            {p.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeletePromo(p.$id)}
                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/5 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
