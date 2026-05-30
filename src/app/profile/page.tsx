"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, ArrowLeft, Loader2, X, Upload, User, Building2 } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { getStorage, ID, BUCKETS } from "@/lib/appwrite";
import { AuthGuard } from "@/guards/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LANGUAGES } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { TranslatorProfile, CompanyProfile, Role } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const role = (user?.prefs?.role as Role) || "translator";

  const [translatorData, setTranslatorData] = React.useState({
    fullName: "",
    bio: "",
    hourlyRate: "",
    phone: "",
    languages: [] as string[],
    specializations: [] as string[],
  });

  const [companyData, setCompanyData] = React.useState({
    companyName: "",
    fullName: "",
    contactPerson: "",
    phone: "",
  });

  const [profileExists, setProfileExists] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function load() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        if (role === "translator") {
          const profile = await services.profile.getTranslatorProfile(user.$id);
          if (profile) {
            setProfileExists(true);
            setAvatarUrl(profile.avatarUrl || "");
            setTranslatorData({
              fullName: profile.fullName || user.name || "",
              bio: profile.bio || "",
              hourlyRate: profile.hourlyRate?.toString() || "",
              phone: profile.phone || "",
              languages: profile.languages || [],
              specializations: profile.specializations || [],
            });
          } else {
            setTranslatorData((prev) => ({ ...prev, fullName: user.name || "" }));
          }
        } else if (role === "company") {
          const profile = await services.profile.getCompanyProfile(user.$id);
          if (profile) {
            setProfileExists(true);
            setLogoUrl(profile.logoUrl || "");
            setCompanyData({
              companyName: profile.companyName || "",
              fullName: profile.fullName || user.name || "",
              contactPerson: profile.contactPerson || "",
              phone: profile.phone || "",
            });
          } else {
            setCompanyData((prev) => ({ ...prev, fullName: user.name || "" }));
          }
        }
      } catch {
        toast({ title: "Error loading profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.$id, role, user?.name, toast]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.PROFILE_IMAGES, ID.unique(), file);
      const viewUrl = storage.getFileView(BUCKETS.PROFILE_IMAGES, uploaded.$id);
      if (role === "translator") {
        setAvatarUrl(viewUrl.toString());
      } else {
        setLogoUrl(viewUrl.toString());
      }
      toast({ title: "Image uploaded", variant: "success" });
    } catch {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!user?.$id) return;
    setSaving(true);
    try {
      const services = getServices();
      if (role === "translator") {
        await services.profile.updateTranslatorProfile(user.$id, {
          fullName: translatorData.fullName,
          bio: translatorData.bio,
          hourlyRate: translatorData.hourlyRate ? Number(translatorData.hourlyRate) : undefined,
          phone: translatorData.phone,
          languages: translatorData.languages,
          specializations: translatorData.specializations,
          avatarUrl: avatarUrl || undefined,
          email: user.email || "",
        });
      } else if (role === "company") {
        await services.profile.updateCompanyProfile(user.$id, {
          companyName: companyData.companyName,
          fullName: companyData.fullName,
          contactPerson: companyData.contactPerson,
          phone: companyData.phone,
          logoUrl: logoUrl || undefined,
          email: user.email || "",
        });
      }
      toast({
        title: profileExists ? "Profile updated" : "Profile created",
        variant: "success",
      });
      setProfileExists(true);
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function toggleLanguage(code: string) {
    setTranslatorData((prev) => ({
      ...prev,
      languages: prev.languages.includes(code)
        ? prev.languages.filter((l) => l !== code)
        : [...prev.languages, code],
    }));
  }

  function toggleSpecialization(spec: string) {
    setTranslatorData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  }

  if (role === "admin" || role === "staff") {
    return (
      <AuthGuard>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Profile management is not available for {role} accounts.</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(DASHBOARD_ROUTES[role])}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              {profileExists ? "Edit your profile information" : "Set up your profile to get started"}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : role === "translator" ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Upload your avatar</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                  {avatarUrl && (
                    <p className="text-xs text-muted-foreground">Click to change</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your name and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={translatorData.fullName}
                    onChange={(e) => setTranslatorData((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={translatorData.phone}
                    onChange={(e) => setTranslatorData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Info</CardTitle>
                <CardDescription>Your bio, rates, and expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    value={translatorData.bio}
                    onChange={(e) => setTranslatorData((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell clients about your experience and skills..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD, optional)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.5"
                    value={translatorData.hourlyRate}
                    onChange={(e) => setTranslatorData((p) => ({ ...p, hourlyRate: e.target.value }))}
                    placeholder="25.00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Select the languages you work with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const selected = translatorData.languages.includes(lang.code);
                    return (
                      <Badge
                        key={lang.code}
                        variant={selected ? "default" : "outline"}
                        className="cursor-pointer select-none transition-colors"
                        onClick={() => toggleLanguage(lang.code)}
                      >
                        {lang.name}
                        {selected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
                <CardDescription>Select your areas of expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((spec) => {
                    const selected = translatorData.specializations.includes(spec);
                    return (
                      <Badge
                        key={spec}
                        variant={selected ? "default" : "outline"}
                        className="cursor-pointer select-none transition-colors"
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {spec}
                        {selected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>Upload your company logo</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
                  {logoUrl ? (
                    <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </Button>
                  {logoUrl && (
                    <p className="text-xs text-muted-foreground">Click to change</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Your company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Contact Full Name</Label>
                  <Input
                    id="fullName"
                    value={companyData.fullName}
                    onChange={(e) => setCompanyData((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={companyData.contactPerson}
                    onChange={(e) => setCompanyData((p) => ({ ...p, contactPerson: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push(DASHBOARD_ROUTES[role])}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {profileExists ? "Save Changes" : "Create Profile"}
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}
