"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  Save, ArrowLeft, Loader2, X, Upload, User, Building2, CheckCircle, 
  Edit3, Eye, FileText, Download, Globe, Award, Briefcase, 
  DollarSign, Key, Settings, ExternalLink, ChevronRight, Check, Sparkles, MapPin
} from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { getStorage, ID, BUCKETS, getAccount } from "@/lib/appwrite";
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
import { COUNTRIES } from "@/data/countries";
import { useDynamicSEO } from "@/hooks/use-dynamic-seo";
import { ResponsiveSelect } from "@/components/ui/responsive-select";

const AVAILABLE_SERVICES = [
  { id: "translation", name: "Translation", defaultUnit: "word" },
  { id: "proofreading", name: "Proofreading", defaultUnit: "word" },
  { id: "mtpe", name: "MTPE (Machine Translation Post-Editing)", defaultUnit: "word" },
  { id: "subtitling", name: "Subtitling", defaultUnit: "minute" },
  { id: "transcription", name: "Transcription", defaultUnit: "minute" },
  { id: "localization", name: "Localization", defaultUnit: "word" },
];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useSession();
  const targetUserId = searchParams.get("userId") || user?.$id || "";
  const services = getServices();
  const { toast } = useToast();

  const [viewMode, setViewMode] = React.useState(false);
  const isViewingOthers = targetUserId !== user?.$id;
  const [targetRole, setTargetRole] = React.useState<Role>("translator");
  const role = isViewingOthers ? targetRole : ((user?.prefs?.role as Role) || "translator");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (isViewingOthers) {
      setViewMode(true);
    }
  }, [isViewingOthers]);

  // Translator state
  const [translatorData, setTranslatorData] = React.useState({
    fullName: "",
    bio: "",
    hourlyRate: "",
    phone: "",
    address: "",
    country: "",
    languages: [] as string[],
    nativeLanguage: "",
    activePairs: [] as string[],
    specializations: [] as string[],
    catTools: [] as string[],
    cvUrl: "",
    isPublicPlatform: true,
    searchEngines: [] as string[],
    seoKeywords: "",
    planTier: "free",
    pricing: [] as { serviceId: string; rate: number; unit: string }[],
    paypalEmail: "",
    languagesUnlocked: false,
  });

  // Company state
  const [companyData, setCompanyData] = React.useState({
    companyName: "",
    fullName: "",
    contactPerson: "",
    contactPersonTitle: "",
    phone: "",
    address: "",
    country: "",
    website: "",
    companySize: "",
    about: "",
    registrationDoc: "",
    taxDoc: "",
    brochureUrl: "",
    isPublicPlatform: true,
    searchEngines: [] as string[],
    seoKeywords: "",
    paypalEmail: "",
    planTier: "free",
  });

  const [ratingVal, setRatingVal] = React.useState<number>(0);
  const [ratingCount, setRatingCount] = React.useState<number>(0);

  const [profileExists, setProfileExists] = React.useState(false);
  const [countrySearch, setCountrySearch] = React.useState("");
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [isVerified, setIsVerified] = React.useState(false);

  // Language Change Requests states
  const [changeRequests, setChangeRequests] = React.useState<any[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false);
  const [requestedLanguages, setRequestedLanguages] = React.useState<string[]>([]);
  const [requestReason, setRequestReason] = React.useState("");
  const [submittingRequest, setSubmittingRequest] = React.useState(false);
  const [initialLanguages, setInitialLanguages] = React.useState<string[]>([]);

  // Dynamically set SEO settings based on the currently displayed profile
  useDynamicSEO(role === "translator" ? {
    isPublic: translatorData.isPublicPlatform,
    searchEngines: translatorData.searchEngines,
    seoKeywords: translatorData.seoKeywords,
  } : {
    isPublic: companyData.isPublicPlatform,
    searchEngines: companyData.searchEngines,
    seoKeywords: companyData.seoKeywords,
  });
  
  // Uploading indicators
  const [uploading, setUploading] = React.useState(false);
  const [cvUploading, setCvUploading] = React.useState(false);
  const [brochureUploading, setBrochureUploading] = React.useState(false);
  const [regUploading, setRegUploading] = React.useState(false);
  const [taxUploading, setTaxUploading] = React.useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cvFileInputRef = React.useRef<HTMLInputElement>(null);
  const brochureFileInputRef = React.useRef<HTMLInputElement>(null);
  const regFileInputRef = React.useRef<HTMLInputElement>(null);
  const taxFileInputRef = React.useRef<HTMLInputElement>(null);

  // Common CAT tools options
  const CAT_TOOLS_OPTIONS = ["SDL Trados", "MemoQ", "Phrase (Memsource)", "Wordfast", "Smartcat", "Matecat", "XTM Cloud", "OmegaT"];

  React.useEffect(() => {
    async function load() {
      if (!targetUserId) return;
      try {
        const services = getServices();
        let foundProfile = false;

        // Fetch ratings info
        try {
          const avg = await services.rating.getAverageRating(targetUserId);
          const all = await services.rating.getRatings(targetUserId);
          setRatingVal(avg || 0);
          setRatingCount(all?.length || 0);
        } catch (e) {
          console.error("Failed to load ratings", e);
        }

        // If viewing others, check translator profile first
        const translatorProfile = await services.profile.getTranslatorProfile(targetUserId);
        if (translatorProfile) {
          setTargetRole("translator");
          setProfileExists(true);
          setAvatarUrl(translatorProfile.avatarUrl || "");
          setIsVerified(translatorProfile.isVerified || false);
          
          let parsedPricing: { serviceId: string; rate: number; unit: string }[] = [];
          if (translatorProfile.pricing) {
            try {
              parsedPricing = typeof translatorProfile.pricing === "string"
                ? JSON.parse(translatorProfile.pricing)
                : translatorProfile.pricing;
            } catch (e) {
              console.error("Failed to parse pricing", e);
            }
          }

          let parsedPairs: string[] = [];
          if (translatorProfile.languagePairs) {
            try {
              const pairs = typeof translatorProfile.languagePairs === "string"
                ? JSON.parse(translatorProfile.languagePairs)
                : translatorProfile.languagePairs;
              if (Array.isArray(pairs)) {
                parsedPairs = pairs.map((p: any) => `${p.source}-${p.target}`);
              }
            } catch (e) {
              console.error("Failed to parse language pairs", e);
            }
          }

          setTranslatorData({
            fullName: translatorProfile.fullName || "",
            bio: translatorProfile.bio || "",
            hourlyRate: "",
            phone: translatorProfile.phone || "",
            address: translatorProfile.address || "",
            country: translatorProfile.country || "",
            languages: translatorProfile.languages || [],
            nativeLanguage: translatorProfile.nativeLanguage || "",
            activePairs: parsedPairs,
            specializations: translatorProfile.specializations || [],
            catTools: translatorProfile.catTools || [],
            cvUrl: translatorProfile.cvUrl || "",
            isPublicPlatform: translatorProfile.isPublicPlatform ?? true,
            searchEngines: translatorProfile.searchEngines || [],
            seoKeywords: translatorProfile.seoKeywords || "",
            planTier: translatorProfile.planTier || "free",
            pricing: parsedPricing,
            paypalEmail: translatorProfile.paypalEmail || "",
            languagesUnlocked: (translatorProfile as any).languagesUnlocked || false,
          });
          setInitialLanguages(translatorProfile.languages || []);
          foundProfile = true;

          // Fetch language change requests
          try {
            const account = getAccount();
            const headers: Record<string, string> = {};
            try {
              const jwtObj = await account.createJWT();
              if (jwtObj?.jwt) {
                headers["Authorization"] = `Bearer ${jwtObj.jwt}`;
              }
            } catch (jwtErr) {
              console.warn("Failed to generate JWT for language requests fetch:", jwtErr);
            }

            const requestsRes = await fetch("/api/language-requests", { headers });
            if (requestsRes.ok) {
              const reqData = await requestsRes.json();
              setChangeRequests(reqData.requests || []);
            }
          } catch (e) {
            console.error("Failed to load language requests", e);
          }
        }

        // If not a translator profile, check company profile next
        if (!foundProfile) {
          const companyProfile = await services.profile.getCompanyProfile(targetUserId);
          if (companyProfile) {
            setTargetRole("company");
            setProfileExists(true);
            setLogoUrl(companyProfile.logoUrl || "");
            setIsVerified(companyProfile.isVerified || false);
            setCompanyData({
              companyName: companyProfile.companyName || "",
              fullName: companyProfile.fullName || "",
              contactPerson: companyProfile.contactPerson || "",
              contactPersonTitle: companyProfile.contactPersonTitle || "",
              phone: companyProfile.phone || "",
              address: companyProfile.address || "",
              country: companyProfile.country || "",
              website: companyProfile.website || "",
              companySize: companyProfile.companySize || "",
              about: companyProfile.about || "",
              registrationDoc: companyProfile.registrationDoc || "",
              taxDoc: companyProfile.taxDoc || "",
              brochureUrl: (companyProfile as any).brochureUrl || "",
              isPublicPlatform: companyProfile.isPublicPlatform ?? true,
              searchEngines: companyProfile.searchEngines || [],
              seoKeywords: companyProfile.seoKeywords || "",
              paypalEmail: companyProfile.paypalEmail || "",
              planTier: companyProfile.planTier || "free",
            });
            foundProfile = true;
          }
        }

        // Fallback for self profile onboarding
        if (!foundProfile && !isViewingOthers && user) {
          if (role === "translator") {
            setTranslatorData((prev) => ({ ...prev, fullName: user.name || "" }));
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
  }, [targetUserId, role, user, isViewingOthers, toast]);

  // Profile completion calculation
  const completionPercentage = React.useMemo(() => {
    if (role === "translator") {
      let score = 0;
      if (translatorData.fullName) score += 15;
      if (avatarUrl) score += 15;
      if (translatorData.phone) score += 10;
      if (translatorData.bio) score += 15;
      if (translatorData.languages.length > 0) score += 25;
      if (translatorData.specializations.length > 0) score += 10;
      if (translatorData.cvUrl) score += 10;
      return score;
    } else {
      let score = 0;
      if (companyData.companyName) score += 15;
      if (logoUrl) score += 15;
      if (companyData.fullName) score += 10;
      if (companyData.contactPerson) score += 10;
      if (companyData.phone) score += 10;
      if (companyData.website) score += 10;
      if (companyData.companySize) score += 10;
      if (companyData.about) score += 10;
      if (companyData.brochureUrl) score += 10;
      return score;
    }
  }, [role, translatorData, companyData, avatarUrl, logoUrl]);

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
      toast({ title: "Profile avatar updated successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to upload profile avatar", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: "cv" | "brochure" | "registration" | "tax") {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "cv") setCvUploading(true);
    else if (type === "brochure") setBrochureUploading(true);
    else if (type === "registration") setRegUploading(true);
    else setTaxUploading(true);

    try {
      const storage = getStorage();
      const bucketId = type === "cv" ? BUCKETS.TRANSLATOR_DOCUMENTS : BUCKETS.COMPANY_DOCUMENTS;
      const uploaded = await storage.createFile(bucketId, ID.unique(), file);
      const fileUrl = storage.getFileView(bucketId, uploaded.$id).toString();

      if (type === "cv") {
        setTranslatorData(p => ({ ...p, cvUrl: fileUrl }));
        toast({ title: "CV uploaded successfully", variant: "success" });
      } else if (type === "brochure") {
        setCompanyData(p => ({ ...p, brochureUrl: fileUrl }));
        toast({ title: "Corporate Brochure uploaded successfully", variant: "success" });
      } else {
        setCompanyData(p => ({ ...p, [type === "registration" ? "registrationDoc" : "taxDoc"]: fileUrl }));
        toast({ title: `${type === "registration" ? "Registration" : "Tax"} document uploaded`, variant: "success" });
      }
    } catch {
      toast({ title: "Failed to upload document", variant: "destructive" });
    } finally {
      if (type === "cv") {
        setCvUploading(false);
        if (cvFileInputRef.current) cvFileInputRef.current.value = "";
      } else if (type === "brochure") {
        setBrochureUploading(false);
        if (brochureFileInputRef.current) brochureFileInputRef.current.value = "";
      } else if (type === "registration") {
        setRegUploading(false);
        if (regFileInputRef.current) regFileInputRef.current.value = "";
      } else {
        setTaxUploading(false);
        if (taxFileInputRef.current) taxFileInputRef.current.value = "";
      }
    }
  }

  const handleSendChangeRequest = async () => {
    if (requestedLanguages.length < 2) {
      toast({
        title: "At Least 2 Languages Required",
        description: "You must request at least 2 working languages.",
        variant: "destructive"
      });
      return;
    }
    if (!requestReason || requestReason.trim().length < 5) {
      toast({
        title: "Reason Required",
        description: "Please provide a valid reason (minimum 5 characters) for your request.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingRequest(true);
    try {
      const account = getAccount();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const jwtObj = await account.createJWT();
        if (jwtObj?.jwt) {
          headers["Authorization"] = `Bearer ${jwtObj.jwt}`;
        }
      } catch (jwtErr) {
        console.warn("Failed to generate JWT for language requests POST:", jwtErr);
      }

      const res = await fetch("/api/language-requests", {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestedLanguages,
          reason: requestReason.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      toast({
        title: "Change Request Submitted",
        description: "Your language change request has been submitted to administrators.",
        variant: "success"
      });

      setChangeRequests(prev => [data.request, ...prev]);
      setIsRequestModalOpen(false);
      setRequestReason("");
    } catch (e: any) {
      toast({
        title: "Submission Failed",
        description: e.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  async function handleSave() {
    if (!user?.$id) return;
    setSaving(true);
    try {
      const services = getServices();
      if (role === "translator") {
        const maxLangs = translatorData.planTier === "standard" || translatorData.planTier === "pro" ? 5 : translatorData.planTier === "plus" ? 7 : 2;
        if (translatorData.languages.length < 2) {
          toast({
            title: "At Least 2 Languages Required",
            description: "You must select at least 2 working languages to configure your translation pairs.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
        if (translatorData.languages.length > maxLangs) {
          toast({
            title: "Language Limit Exceeded",
            description: `You can select up to ${maxLangs} languages for your plan tier (${translatorData.planTier === "standard" || translatorData.planTier === "pro" ? "Pro" : translatorData.planTier === "plus" ? "Plus" : "Free"}).`,
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
        const languagesChanged = JSON.stringify([...translatorData.languages].sort()) !== JSON.stringify([...initialLanguages].sort());
        
        const translatorPayload: any = {
          fullName: translatorData.fullName,
          bio: translatorData.bio,
          hourlyRate: 0,
          phone: translatorData.phone,
          address: translatorData.address,
          country: translatorData.country,
          languages: translatorData.languages,
          nativeLanguage: translatorData.nativeLanguage,
          languagePairs: JSON.stringify(
            translatorData.activePairs.map((p) => {
              const [src, tgt] = p.split("-");
              return { source: src, target: tgt, level: "advanced" };
            })
          ) as any,
          specializations: translatorData.specializations,
          catTools: translatorData.catTools,
          cvUrl: translatorData.cvUrl,
          isPublicPlatform: translatorData.isPublicPlatform,
          searchEngines: translatorData.searchEngines,
          seoKeywords: translatorData.seoKeywords,
          avatarUrl: avatarUrl || undefined,
          email: user.email || "",
          onboardingComplete: true,
          pricing: JSON.stringify(translatorData.pricing || []),
          paypalEmail: translatorData.paypalEmail || undefined,
        };

        if (languagesChanged) {
          translatorPayload.isVerified = false;
          translatorPayload.verificationStatus = "unverified";
          translatorPayload.languagesUnlocked = false; // relock it!
        }

        await services.profile.updateTranslatorProfile(user.$id, translatorPayload);

        if (languagesChanged) {
          setTranslatorData(prev => ({
            ...prev,
            languagesUnlocked: false
          }));
          setInitialLanguages(translatorData.languages);
        }
      } else {
        await services.profile.updateCompanyProfile(user.$id, {
          companyName: companyData.companyName,
          fullName: companyData.fullName,
          contactPerson: companyData.contactPerson,
          contactPersonTitle: companyData.contactPersonTitle,
          phone: companyData.phone,
          address: companyData.address,
          country: companyData.country,
          logoUrl: logoUrl || undefined,
          email: user.email || "",
          website: companyData.website,
          companySize: companyData.companySize,
          about: companyData.about,
          registrationDoc: companyData.registrationDoc || undefined,
          taxDoc: companyData.taxDoc || undefined,
          brochureUrl: companyData.brochureUrl || undefined,
          isPublicPlatform: companyData.isPublicPlatform,
          searchEngines: companyData.searchEngines,
          seoKeywords: companyData.seoKeywords,
          onboardingComplete: true,
          paypalEmail: companyData.paypalEmail || undefined,
        } as any);
      }
      toast({
        title: profileExists ? "Profile successfully updated" : "Profile successfully created",
        variant: "success",
      });
      setProfileExists(true);
      setViewMode(true);
    } catch {
      toast({ title: "Failed to save profile details", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function toggleLanguage(code: string) {
    setTranslatorData((prev) => {
      const isSelected = prev.languages.includes(code);
      if (isSelected) {
        const newNative = prev.nativeLanguage === code ? "" : prev.nativeLanguage;
        const newActivePairs = prev.activePairs.filter(p => {
          const [src, tgt] = p.split("-");
          return src !== code && tgt !== code;
        });
        return {
          ...prev,
          languages: prev.languages.filter((l) => l !== code),
          nativeLanguage: newNative,
          activePairs: newActivePairs,
        };
      }
      const limit = prev.planTier === "standard" || prev.planTier === "pro" ? 5 : prev.planTier === "plus" ? 7 : 2;
      if (prev.languages.length >= limit) {
        toast({
          title: "Language Limit Reached",
          description: `Your plan (${prev.planTier === "standard" || prev.planTier === "pro" ? "Pro" : prev.planTier === "plus" ? "Plus" : "Free"}) is limited to ${limit} language(s). Please upgrade to add more.`,
          variant: "destructive",
        });
        return prev;
      }
      return {
        ...prev,
        languages: [...prev.languages, code],
      };
    });
  }

  function toggleSpecialization(spec: string) {
    setTranslatorData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  }

  function toggleActivePair(pair: string) {
    setTranslatorData((prev) => {
      const isSelected = prev.activePairs.includes(pair);
      if (isSelected) {
        return {
          ...prev,
          activePairs: prev.activePairs.filter((p) => p !== pair),
        };
      }
      
      const maxPairs = prev.planTier === "standard" || prev.planTier === "pro" ? 32 : prev.planTier === "plus" ? 128 : 4;
      if (prev.activePairs.length >= maxPairs) {
        toast({
          title: "Language Pair Limit Reached",
          description: `Your plan (${prev.planTier === "standard" || prev.planTier === "pro" ? "Pro" : prev.planTier === "plus" ? "Plus" : "Free"}) is limited to ${maxPairs} active pairs. Please upgrade to add more.`,
          variant: "destructive",
        });
        return prev;
      }
      
      return {
        ...prev,
        activePairs: [...prev.activePairs, pair],
      };
    });
  }

  function toggleService(serviceId: string, defaultUnit: string) {
    setTranslatorData((prev) => {
      const exists = prev.pricing.some((item) => item.serviceId === serviceId);
      if (exists) {
        return {
          ...prev,
          pricing: prev.pricing.filter((item) => item.serviceId !== serviceId),
        };
      }
      return {
        ...prev,
        pricing: [...prev.pricing, { serviceId, rate: 0.05, unit: defaultUnit }],
      };
    });
  }

  function handleServiceRateChange(serviceId: string, rate: number) {
    setTranslatorData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((item) =>
        item.serviceId === serviceId ? { ...item, rate } : item
      ),
    }));
  }

  function toggleCatTool(tool: string) {
    setTranslatorData((prev) => ({
      ...prev,
      catTools: prev.catTools.includes(tool)
        ? prev.catTools.filter((t) => t !== tool)
        : [...prev.catTools, tool],
    }));
  }

  function toggleSearchEngine(engine: string) {
    if (role === "translator") {
      setTranslatorData((prev) => ({
        ...prev,
        searchEngines: prev.searchEngines.includes(engine)
          ? prev.searchEngines.filter((e) => e !== engine)
          : [...prev.searchEngines, engine],
      }));
    } else {
      setCompanyData((prev) => ({
        ...prev,
        searchEngines: prev.searchEngines.includes(engine)
          ? prev.searchEngines.filter((e) => e !== engine)
          : [...prev.searchEngines, engine],
      }));
    }
  }

  if (role === "admin" || role === "staff") {
    return (
      <AuthGuard>
        <div className="max-w-2xl mx-auto space-y-6 pt-12">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Profile management is not available for {role} accounts.</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Person / Organization / ProfessionalService Schema
  const isPublic = role === "translator" ? translatorData.isPublicPlatform : companyData.isPublicPlatform;
  const profileJsonLd = profileExists && isPublic ? (role === "translator" ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": translatorData.fullName || user?.name,
    "description": translatorData.bio,
    "image": avatarUrl,
    "knowsLanguage": translatorData.languages.map((l) => ({
      "@type": "Language",
      "name": l
    })),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": translatorData.address,
      "addressCountry": translatorData.country
    },
    ...(ratingVal > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": ratingVal,
        "reviewCount": ratingCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    ...(translatorData.seoKeywords && {
      "keywords": translatorData.seoKeywords
    })
  } : {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": companyData.companyName || "Translation Company",
    "description": companyData.about,
    "logo": logoUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": companyData.address,
      "addressCountry": companyData.country
    },
    ...(companyData.website && {
      "url": companyData.website
    }),
    ...(ratingVal > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": ratingVal,
        "reviewCount": ratingCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    })
  }) : null;

  return (
    <AuthGuard>
      {profileJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
        />
      )}
      <div className="max-w-4xl mx-auto space-y-6 pt-8 pb-16 px-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push(DASHBOARD_ROUTES[role])}
              className="rounded-xl bg-background/50 backdrop-blur-md border-border/40 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground/95">My Profile</h1>
              <p className="text-sm text-muted-foreground">
                Manage your credentials, visibility settings, and documents
              </p>
            </div>
          </div>
          
          {!isViewingOthers && (
            <Button
              onClick={() => setViewMode(!viewMode)}
              variant={viewMode ? "default" : "outline"}
              className="rounded-xl gap-2 font-medium shadow-sm transition-all"
            >
              {viewMode ? (
                <>
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> View Showcase
                </>
              )}
            </Button>
          )}
        </div>

        {/* Dynamic Header Tracker */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Core Info Banner Card */}
          <Card className="glass-card md:col-span-3 p-6 border-border/40 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-background/30 to-accent/5">
            <div className="flex items-center gap-6">
              <div className="relative h-20 w-20 shrink-0">
                <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-teal-500/20 shadow-md">
                  {role === "translator" ? (
                    avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )
                  ) : (
                    logoUrl ? (
                      <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )
                  )}
                </div>
                {isVerified && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 border-2 border-background shadow-md">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    {role === "translator" ? translatorData.fullName || user?.name : companyData.companyName || "New Company"}
                  </h2>
                  <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20 capitalize font-medium rounded-lg">
                    {role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground/60" /> {user?.email}
                </p>

                {/* Country and Address Info */}
                {((role === "translator" ? (translatorData.country || translatorData.address) : (companyData.country || companyData.address))) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span>
                      {[
                        role === "translator" ? translatorData.address : companyData.address,
                        role === "translator" ? translatorData.country : companyData.country
                      ].filter(Boolean).join(", ")}
                    </span>
                  </p>
                )}
                
                {/* Interactive Rating Indicator */}
                <div 
                  className="flex items-center gap-1.5 mt-1 cursor-pointer hover:opacity-85 transition-opacity" 
                  onClick={() => router.push(`/profile/reviews?userId=${targetUserId}`)}
                >
                  <div className="flex items-center text-amber-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>
                        {i < Math.round(ratingVal) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-foreground/90">{ratingVal.toFixed(1)}</span>
                  <span className="text-3xs text-muted-foreground">({ratingCount} {ratingCount === 1 ? "review" : "reviews"})</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/20 flex flex-wrap gap-4 items-center justify-between text-2xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Account Status: <strong className="text-emerald-500 font-semibold">Active</strong></span>
                {role === "translator" && (
                  <span>Verified: <strong className={isVerified ? "text-teal-500" : "text-amber-500"}>{isVerified ? "Yes" : "No"}</strong></span>
                )}
              </div>
              <Badge variant="outline" className="bg-teal-500/10 border-teal-500/20 text-teal-600 font-medium capitalize">
                Plan Tier: {role === "translator" ? (translatorData.planTier || "free") : (companyData.planTier || "free")}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Document Selectors hidden triggers */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={cvFileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, "cv")} />
        <input ref={brochureFileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, "brochure")} />
        <input ref={regFileInputRef} type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => handleFileUpload(e, "registration")} />
        <input ref={taxFileInputRef} type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => handleFileUpload(e, "tax")} />

        {/* -------------------- SHOWCASE VIEW MODE -------------------- */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : viewMode ? (
          <div className="space-y-6">
            
            {/* Biography & Core Text block */}
            <Card className="glass-card p-6 border-border/40 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-teal-500" />
                <h3 className="font-bold text-base text-foreground">Biography & About Me</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {role === "translator" 
                  ? translatorData.bio || "No biography added yet. Click 'Edit Profile' to add a summary of your professional expertise!"
                  : companyData.about || "No corporate description provided yet. Click 'Edit Profile' to introduce your company details!"}
              </p>
            </Card>

            {/* Language Pairs Card */}
            {role === "translator" && translatorData.activePairs.length > 0 && (
              <Card className="glass-card p-6 border-border/40 rounded-2xl bg-gradient-to-br from-background/30 to-teal-500/5 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-teal-500" />
                  <h3 className="font-bold text-base text-foreground">Language Pairs</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {translatorData.activePairs.map((pair) => {
                    const [sourceCode, targetCode] = pair.split("-");
                    const sourceName = LANGUAGES.find(l => l.code === sourceCode)?.name || sourceCode;
                    const targetName = LANGUAGES.find(l => l.code === targetCode)?.name || targetCode;
                    return (
                      <Badge key={pair} variant="outline" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border-teal-500/20 text-teal-700 bg-teal-500/5 flex items-center gap-2">
                        <span>{sourceName}</span>
                        <span className="text-teal-400 font-bold">→</span>
                        <span>{targetName}</span>
                      </Badge>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Services Offered & Rates card */}
            {role === "translator" && (
              <Card className="glass-card p-6 border-border/40 rounded-2xl bg-gradient-to-br from-background/30 to-teal-500/5 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-teal-500 animate-pulse" />
                  <h3 className="font-bold text-base text-foreground">Services Offered & Rates</h3>
                </div>
                {translatorData.pricing && translatorData.pricing.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {translatorData.pricing.map((item) => {
                      const serviceName = AVAILABLE_SERVICES.find(s => s.id === item.serviceId)?.name || item.serviceId;
                      return (
                        <div key={item.serviceId} className="p-4 rounded-xl border border-border/50 bg-background/50 flex items-center justify-between shadow-sm transition-transform hover:scale-[1.01] hover:border-teal-500/30">
                          <div className="space-y-1">
                            <span className="font-bold text-xs text-foreground block">{serviceName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-teal-600">${item.rate}</span>
                            <span className="text-4xs text-muted-foreground block font-medium">USD / {item.unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-xl bg-background/20">
                    <p className="text-xs text-muted-foreground">No services declared yet.</p>
                    {!isViewingOthers && (
                      <Button size="sm" variant="outline" onClick={() => setViewMode(false)} className="mt-3 rounded-lg text-2xs hover:bg-teal-50/10">
                        Add Services & Rates
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Specializations & Tools pill area */}
            {role === "translator" ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Languages Pair & Specializations */}
                <Card className="glass-card p-6 border-border/40 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-teal-500" />
                    <h3 className="font-bold text-base text-foreground">Specializations</h3>
                  </div>
                  <p className="text-2xs text-muted-foreground mb-4">
                    Linguists specializing in specific industries guarantee terminology accuracy and native translation flow for targeted subject matter.
                  </p>
                  <div className="space-y-2">
                    {translatorData.specializations.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {translatorData.specializations.map((spec) => (
                          <Badge key={spec} variant="outline" className="rounded-lg text-2xs border-teal-500/20 text-teal-600 bg-teal-500/5 font-medium">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xs text-muted-foreground">No specializations declared.</p>
                    )}
                  </div>
                </Card>

                {/* CAT Tools area */}
                <Card className="glass-card p-6 border-border/40 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-teal-500" />
                    <h3 className="font-bold text-base text-foreground">CAT Tools Mastery</h3>
                  </div>
                  <p className="text-2xs text-muted-foreground mb-4">
                    Linguists mastering modern CAT tools guarantee high formatting precision and localized terminology mapping.
                  </p>
                  {translatorData.catTools.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {translatorData.catTools.map((tool) => (
                        <Badge key={tool} className="rounded-lg text-2xs bg-accent/20 text-foreground border-border/60 font-semibold">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-2xs text-muted-foreground">No CAT tools declared yet.</p>
                  )}
                </Card>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Company Details */}
                <Card className="glass-card p-6 border-border/40 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-teal-500" />
                    <h3 className="font-bold text-base text-foreground">Corporate Structure</h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/10">
                      <span className="text-muted-foreground">Contact Person:</span>
                      <span className="font-semibold text-foreground">{companyData.contactPerson || "Not Declared"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/10">
                      <span className="text-muted-foreground">Company Size:</span>
                      <Badge variant="secondary" className="rounded-md font-medium text-3xs">
                        {companyData.companySize || "Not Declared"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Website:</span>
                      {companyData.website ? (
                        <a 
                          href={companyData.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-semibold text-teal-600 flex items-center gap-1 hover:underline"
                        >
                          Visit Site <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Not Declared</span>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Verification Documents Status Card */}
                <Card className="glass-card p-6 border-border/40 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-teal-500" />
                    <h3 className="font-bold text-base text-foreground">Verification status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-accent/5">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold">Commercial Registration</h4>
                        <p className="text-4xs text-muted-foreground">For corporate vetting</p>
                      </div>
                      {companyData.registrationDoc ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-4xs rounded-md">Uploaded</Badge>
                      ) : (
                        <Badge variant="outline" className="text-4xs rounded-md">Pending Upload</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-accent/5">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold">Tax Certificate</h4>
                        <p className="text-4xs text-muted-foreground">For VAT validation</p>
                      </div>
                      {companyData.taxDoc ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-4xs rounded-md">Uploaded</Badge>
                      ) : (
                        <Badge variant="outline" className="text-4xs rounded-md">Pending Upload</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Premium CV / Brochure Showcase Card */}
            <Card className="glass-card p-6 border-border/40 rounded-2xl relative overflow-hidden bg-gradient-to-r from-teal-500/5 to-accent/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                  <h3 className="font-bold text-base text-foreground">
                    {role === "translator" ? "Linguist CV & Resume" : "Corporate Profile Brochure"}
                  </h3>
                </div>
                {((role === "translator" && translatorData.cvUrl) || (role === "company" && companyData.brochureUrl)) && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-4xs rounded-lg">
                    Verified File
                  </Badge>
                )}
              </div>

              {role === "translator" ? (
                translatorData.cvUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-background/60 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <h4 className="text-xs font-bold text-foreground">CV_Translator_Professional.pdf</h4>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <a href={translatorData.cvUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="rounded-lg gap-2 text-2xs w-full">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </a>
                      <a href={translatorData.cvUrl} download className="w-full sm:w-auto">
                        <Button size="sm" className="rounded-lg gap-2 text-2xs bg-teal-600 hover:bg-teal-700 text-white w-full">
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed border-border/50 rounded-xl bg-background/20">
                    <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs font-medium text-muted-foreground">No CV has been uploaded to your profile yet.</p>
                    <p className="text-3xs text-muted-foreground mb-4">Upload a curriculum vitae to qualify for premium verification.</p>
                    <Button size="sm" variant="outline" onClick={() => setViewMode(false)} className="rounded-lg text-2xs gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Upload CV Now
                    </Button>
                  </div>
                )
              ) : (
                companyData.brochureUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-background/60 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <h4 className="text-xs font-bold text-foreground">Corporate_Showcase_Brochure.pdf</h4>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <a href={companyData.brochureUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="rounded-lg gap-2 text-2xs w-full">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </a>
                      <a href={companyData.brochureUrl} download className="w-full sm:w-auto">
                        <Button size="sm" className="rounded-lg gap-2 text-2xs bg-teal-600 hover:bg-teal-700 text-white w-full">
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed border-border/50 rounded-xl bg-background/20">
                    <Building2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs font-medium text-muted-foreground">No Corporate Brochure uploaded yet.</p>
                    <p className="text-3xs text-muted-foreground mb-4">Adding a brochure lets candidates know more about your company.</p>
                    <Button size="sm" variant="outline" onClick={() => setViewMode(false)} className="rounded-lg text-2xs gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Upload Brochure
                    </Button>
                  </div>
                )
              )}
            </Card>


          </div>
        ) : (
          /* -------------------- INTERACTIVE EDIT MODE -------------------- */
          <div className="space-y-6">
            
            {/* Avatar / Logo Card */}
            <Card className="glass-card border-border/40 rounded-2xl p-6 bg-gradient-to-br from-background/30 to-accent/5">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-base font-bold">Profile Picture / Brand Logo</CardTitle>
                <CardDescription className="text-3xs">Upload avatar image to personalize your brand</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 flex items-center gap-6">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-500/20 shadow-md">
                  {role === "translator" ? (
                    avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )
                  ) : (
                    logoUrl ? (
                      <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 rounded-xl"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                  {((role === "translator" && avatarUrl) || (role === "company" && logoUrl)) && (
                    <p className="text-4xs text-muted-foreground">Click button above to modify image</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Role Specific Forms */}
            {role === "translator" ? (
              <div className="space-y-6">
                {/* Basic Details (Translator) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Basic Information</CardTitle>
                    <CardDescription className="text-3xs">Provide your name and contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={translatorData.fullName}
                        onChange={(e) => setTranslatorData((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Your full name"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={translatorData.address}
                          onChange={(e) => setTranslatorData((p) => ({ ...p, address: e.target.value }))}
                          placeholder="Your address"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="country">Country</Label>
                        <div className="relative">
                          <Input
                            placeholder="Type to search country..."
                            value={countrySearch || translatorData.country}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCountrySearch(val);
                              setTranslatorData((p) => ({ ...p, country: val }));
                              setShowCountryDropdown(true);
                            }}
                            onFocus={() => {
                              setCountrySearch(translatorData.country);
                              setShowCountryDropdown(true);
                            }}
                            onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                            className="rounded-xl"
                          />
                          {showCountryDropdown && (
                            <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto bg-background border border-border/80 rounded-xl shadow-lg divide-y divide-border/20">
                              {COUNTRIES.filter(c => c.toLowerCase().includes((countrySearch || "").toLowerCase())).length === 0 ? (
                                <div className="p-3 text-xs text-muted-foreground text-center">No countries found</div>
                              ) : (
                                COUNTRIES.filter(c => c.toLowerCase().includes((countrySearch || "").toLowerCase())).map((c) => (
                                  <div
                                    key={c}
                                    onClick={() => {
                                      setTranslatorData((p) => ({ ...p, country: c }));
                                      setCountrySearch(c);
                                      setShowCountryDropdown(false);
                                    }}
                                    className="p-2.5 text-xs text-left hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  >
                                    {c}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypalEmail">PayPal Payout Email</Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        value={translatorData.paypalEmail}
                        onChange={(e) => setTranslatorData((p) => ({ ...p, paypalEmail: e.target.value }))}
                        placeholder="your-paypal-email@domain.com"
                        className="rounded-xl"
                      />
                      <p className="text-4xs text-muted-foreground">PayPal payouts are sent directly to this address. Ensure it is correct.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Info (Translator) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Professional Biography</CardTitle>
                    <CardDescription className="text-3xs">Provide details about your experience and profile bio</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        value={translatorData.bio}
                        onChange={(e) => setTranslatorData((p) => ({ ...p, bio: e.target.value }))}
                        placeholder="Tell clients about your specialized experience, translation processes..."
                        className="min-h-[110px] rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Languages Pair & Specializations (Translator) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6 relative z-30">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Languages & Expertise</CardTitle>
                    <CardDescription className="text-3xs">Choose spoken/written languages and specialization branches</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-6">
                    {/* Working Languages Selection */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-semibold">Languages Spoken/Written</Label>
                        <Badge variant="outline" className="text-4xs uppercase bg-teal-500/5 text-teal-600 border-teal-500/20 font-bold">
                          Tier: {translatorData.planTier === "standard" || translatorData.planTier === "pro" ? "Pro (Max 5)" : translatorData.planTier === "plus" ? "Plus (Max 7)" : "Free (Max 2)"}
                        </Badge>
                      </div>

                      {profileExists && !translatorData.languagesUnlocked ? (
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2 text-xs">
                          <div className="flex items-center gap-2 font-semibold text-amber-600">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Languages Change Request Required
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            To modify your spoken or written languages, please submit a Change Request. 
                            <strong> Your verification status will reset to unverified upon approval.</strong>
                          </p>
                          {changeRequests.find(r => r.status === "pending") ? (
                            <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 text-[10px] space-y-1">
                              <span className="font-bold block">Pending Request:</span>
                              <div>
                                <strong>Requested:</strong>{" "}
                                {JSON.parse(changeRequests.find(r => r.status === "pending").requestedLanguages)
                                  .map((code: string) => LANGUAGES.find(l => l.code === code)?.name || code)
                                  .join(", ")}
                              </div>
                              <div>
                                <strong>Reason:</strong> {changeRequests.find(r => r.status === "pending").reason}
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => {
                                setRequestedLanguages(translatorData.languages);
                                setIsRequestModalOpen(true);
                              }}
                              className="mt-2 text-2xs h-7 px-3 py-1 font-semibold rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 border border-amber-600/20 transition-all"
                            >
                              Request Language Change
                            </Button>
                          )}
                        </div>
                      ) : (
                        <ResponsiveSelect
                          options={LANGUAGES.map((lang) => ({
                            value: lang.code,
                            label: lang.name,
                          }))}
                          value={translatorData.languages}
                          onChange={(selectedCodes: string[]) => {
                            const prevCodes = translatorData.languages;
                            if (selectedCodes.length > prevCodes.length) {
                              const addedCode = selectedCodes.find(c => !prevCodes.includes(c));
                              if (addedCode) toggleLanguage(addedCode);
                            } else {
                              const removedCode = prevCodes.find(c => !selectedCodes.includes(c));
                              if (removedCode) toggleLanguage(removedCode);
                            }
                          }}
                          multiple={true}
                          placeholder="Select spoken/written languages"
                          searchPlaceholder="Search language..."
                          label="Languages Spoken/Written"
                        />
                      )}

                      {/* Selected Languages Table & Native Designation */}
                      {translatorData.languages.length > 0 && (
                        <div className="overflow-hidden border border-border/40 rounded-xl bg-accent/5 mt-3">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border/40 bg-muted/20 text-3xs uppercase tracking-wider text-muted-foreground font-bold">
                                <th className="p-3 text-3xs font-semibold text-foreground">Language</th>
                                <th className="p-3 text-3xs font-semibold text-foreground text-center">Native Language</th>
                                <th className="p-3 text-3xs font-semibold text-foreground text-right">{profileExists && !translatorData.languagesUnlocked ? "Change Request" : "Action"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {translatorData.languages.map((code) => {
                                const name = LANGUAGES.find((l) => l.code === code)?.name || code;
                                const isNative = translatorData.nativeLanguage === code;
                                return (
                                  <tr key={code} className="hover:bg-accent/10 transition-colors">
                                    <td className="p-3 text-xs font-medium text-foreground">{name}</td>
                                    <td className="p-3 text-center">
                                      <div className="flex justify-center">
                                        <input
                                          type="checkbox"
                                          checked={isNative}
                                          disabled={profileExists && !translatorData.languagesUnlocked}
                                          onChange={() => {
                                            setTranslatorData((prev) => ({ ...prev, nativeLanguage: code }));
                                          }}
                                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-60 cursor-pointer"
                                        />
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      {profileExists && !translatorData.languagesUnlocked ? (
                                        <Button
                                          type="button"
                                          disabled={!!changeRequests.find(r => r.status === "pending")}
                                          onClick={() => {
                                            setRequestedLanguages(translatorData.languages);
                                            setIsRequestModalOpen(true);
                                          }}
                                          className="text-3xs h-7 px-3 py-1 font-semibold rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 border border-teal-500/20 transition-all disabled:opacity-50"
                                        >
                                          {changeRequests.find(r => r.status === "pending") ? "Pending Review" : "Request Change"}
                                        </Button>
                                      ) : (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleLanguage(code)}
                                          className="h-7 w-7 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Dynamic Upgrade CTA when languages limit is active */}
                      <div className="mt-3 flex items-center justify-between p-3 rounded-xl border border-border/40 bg-accent/5">
                        <div className="space-y-0.5">
                          <span className="text-4xs font-bold text-muted-foreground uppercase tracking-wider block">Languages Limit</span>
                          <span className="text-xs font-bold text-foreground">
                            {translatorData.languages.length} / {translatorData.planTier === "standard" || translatorData.planTier === "pro" ? 5 : translatorData.planTier === "plus" ? 7 : 2} Used
                          </span>
                        </div>
                        {translatorData.planTier !== "plus" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => router.push("/dashboard/plans")}
                            className="rounded-lg text-3xs border-teal-500/30 text-teal-600 hover:bg-teal-50/10 gap-1 h-7 px-2.5 py-1 font-semibold"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500 animate-bounce" /> Upgrade Plan
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Language Pairs List (Rendered below languages select in Edit Mode) */}
                    {translatorData.languages.length > 0 && (
                      <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-foreground">Select Working Language Pairs</Label>
                            <p className="text-[10px] text-muted-foreground">Select the translation pairs you want to activate in your profile.</p>
                          </div>
                          {translatorData.languages.length >= 2 && (
                            <Badge variant="outline" className="text-4xs uppercase bg-teal-500/5 text-teal-600 border-teal-500/20 font-bold">
                              Limit: {translatorData.activePairs.length} / {translatorData.planTier === "standard" || translatorData.planTier === "pro" ? 32 : translatorData.planTier === "plus" ? 128 : 4} Pairs
                            </Badge>
                          )}
                        </div>
                        {translatorData.languages.length < 2 ? (
                          <div className="text-2xs text-amber-600 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg font-medium">
                            ⚠️ Please select at least 2 working languages above to configure and select translation pairs.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(() => {
                              const pairsList: { id: string; label: string }[] = [];
                              translatorData.languages.forEach(src => {
                                translatorData.languages.forEach(tgt => {
                                  if (src !== tgt) {
                                    const nameSrc = LANGUAGES.find(l => l.code === src)?.name || src;
                                    const nameTgt = LANGUAGES.find(l => l.code === tgt)?.name || tgt;
                                    pairsList.push({
                                      id: `${src}-${tgt}`,
                                      label: `${nameSrc} → ${nameTgt}`
                                    });
                                  }
                                });
                              });
                              
                              return pairsList.map(pair => {
                                const isActive = translatorData.activePairs.includes(pair.id);
                                return (
                                  <div
                                    key={pair.id}
                                    onClick={() => toggleActivePair(pair.id)}
                                    className={`p-3 rounded-lg border cursor-pointer select-none transition-all flex items-center justify-between ${
                                      isActive
                                        ? "border-teal-500 bg-teal-500/10 shadow-[0_0_10px_rgba(20,184,166,0.15)] text-teal-600 font-bold"
                                        : "border-border/60 hover:border-border hover:bg-accent/30 text-muted-foreground"
                                    }`}
                                  >
                                    <span className="text-xs">{pair.label}</span>
                                    <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${isActive ? "border-teal-500 bg-teal-500 text-white" : "border-muted-foreground"}`}>
                                      {isActive && <Check className="h-2.5 w-2.5" />}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label className="text-xs font-semibold">Translation Specializations</Label>
                      <ResponsiveSelect
                        options={SPECIALIZATIONS.map((spec) => ({
                          value: spec,
                          label: spec,
                        }))}
                        value={translatorData.specializations}
                        onChange={(selectedSpecs: string[]) => {
                          const prevSpecs = translatorData.specializations;
                          if (selectedSpecs.length > prevSpecs.length) {
                            const addedSpec = selectedSpecs.find(s => !prevSpecs.includes(s));
                            if (addedSpec) toggleSpecialization(addedSpec);
                          } else {
                            const removedSpec = prevSpecs.find(s => !selectedSpecs.includes(s));
                            if (removedSpec) toggleSpecialization(removedSpec);
                          }
                        }}
                        multiple={true}
                        placeholder="Select translation specializations"
                        searchPlaceholder="Search specialization..."
                        label="Translation Specializations"
                      />
                      {translatorData.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {translatorData.specializations.map((spec) => (
                            <Badge
                              key={spec}
                              variant="default"
                              className="transition-all rounded-lg py-1 px-2.5 text-3xs flex items-center gap-1 cursor-pointer select-none bg-teal-600/90 text-white"
                              onClick={() => toggleSpecialization(spec)}
                            >
                              {spec}
                              <X className="h-2.5 w-2.5 hover:text-red-200" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Services Offered & Rates Editor (Translator) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6 relative z-20">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Services Offered & Rates</CardTitle>
                    <CardDescription className="text-3xs">Enable the services you provide and define your base rates</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {AVAILABLE_SERVICES.map((service) => {
                        const pricingItem = translatorData.pricing.find((item) => item.serviceId === service.id);
                        const selected = !!pricingItem;
                        return (
                          <div key={service.id} className="p-3 rounded-xl border border-border/40 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-teal-500/20">
                            <div className="flex items-center gap-2">
                              <input
                                id={`service-${service.id}`}
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleService(service.id, service.defaultUnit)}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <Label htmlFor={`service-${service.id}`} className="font-bold text-xs cursor-pointer select-none">
                                {service.name}
                              </Label>
                            </div>
                            {selected && (
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-3xs text-muted-foreground">Rate ($):</span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.001"
                                  value={pricingItem.rate}
                                  onChange={(e) => handleServiceRateChange(service.id, Number(e.target.value))}
                                  className="w-20 h-7 rounded-lg text-xs py-1 px-2"
                                />
                                <span className="text-4xs text-muted-foreground uppercase font-semibold">USD / {pricingItem.unit}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* CAT Tools Mastery Selector */}
                <Card className="glass-card border-border/40 rounded-2xl p-6 relative z-10">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">CAT Tools Integration</CardTitle>
                    <CardDescription className="text-3xs">Select the translation software tools you use</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <ResponsiveSelect
                      options={CAT_TOOLS_OPTIONS.map((tool) => ({
                        value: tool,
                        label: tool,
                      }))}
                      value={translatorData.catTools}
                      onChange={(selectedTools: string[]) => {
                        const prevTools = translatorData.catTools;
                        if (selectedTools.length > prevTools.length) {
                          const addedTool = selectedTools.find(t => !prevTools.includes(t));
                          if (addedTool) toggleCatTool(addedTool);
                        } else {
                          const removedTool = prevTools.find(t => !selectedTools.includes(t));
                          if (removedTool) toggleCatTool(removedTool);
                        }
                      }}
                      multiple={true}
                      placeholder="Select CAT tools"
                      searchPlaceholder="Search CAT tools..."
                      label="CAT Tools Integration"
                    />
                    {translatorData.catTools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {translatorData.catTools.map((tool) => (
                          <Badge
                            key={tool}
                            variant="default"
                            className="transition-all rounded-lg py-1 px-2.5 text-3xs flex items-center gap-1 cursor-pointer select-none bg-teal-600/90 text-white"
                            onClick={() => toggleCatTool(tool)}
                          >
                            {tool}
                            <X className="h-2.5 w-2.5 hover:text-red-200" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Interactive CV Upload */}
                <Card className="glass-card border-border/40 rounded-2xl p-6 relative z-0">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Linguist CV / Resume Upload</CardTitle>
                    <CardDescription className="text-3xs">Upload your professional CV to verify your experience (.pdf only)</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={cvUploading}
                        onClick={() => cvFileInputRef.current?.click()}
                        className="rounded-xl gap-2"
                      >
                        {cvUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {translatorData.cvUrl ? "Change CV File" : "Upload CV File"}
                      </Button>
                      {translatorData.cvUrl && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-lg">
                          CV Uploaded
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* SEO & Visibility Settings (Translator) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Privacy & SEO Indexing</CardTitle>
                    <CardDescription className="text-3xs">Configure your public visibility parameters and search engines targeting</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-accent/5">
                      <div className="space-y-0.5">
                        <Label htmlFor="isPublicPlatform" className="font-bold text-xs">Public platform directory</Label>
                        <p className="text-4xs text-muted-foreground">List your profile in the main translators directory for recruiters</p>
                      </div>
                      <input
                        id="isPublicPlatform"
                        type="checkbox"
                        checked={translatorData.isPublicPlatform}
                        onChange={(e) => setTranslatorData((prev) => ({ ...prev, isPublicPlatform: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Select permitted search engines for indexing</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Google", "Bing", "DuckDuckGo", "Yandex"].map((engine) => {
                          const checked = translatorData.searchEngines.includes(engine);
                          return (
                            <div key={engine} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-background/50">
                              <input
                                id={`engine-${engine}`}
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSearchEngine(engine)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <Label htmlFor={`engine-${engine}`} className="text-3xs font-medium cursor-pointer select-none">
                                {engine}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoKeywords">SEO Keywords (Comma Separated)</Label>
                      <Input
                        id="seoKeywords"
                        value={translatorData.seoKeywords}
                        onChange={(e) => setTranslatorData((p) => ({ ...p, seoKeywords: e.target.value }))}
                        placeholder="arabic translator, legal documents translation, sdl trados expert"
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Details (Company) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Company Information</CardTitle>
                    <CardDescription className="text-3xs">Details describing your corporate identity</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData((p) => ({ ...p, companyName: e.target.value }))}
                        placeholder="Your company name"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Contact Full Name</Label>
                      <Input
                        id="fullName"
                        value={companyData.fullName}
                        onChange={(e) => setCompanyData((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Your full name"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPaypalEmail">PayPal Billing Email</Label>
                      <Input
                        id="companyPaypalEmail"
                        type="email"
                        value={companyData.paypalEmail}
                        onChange={(e) => setCompanyData((p) => ({ ...p, paypalEmail: e.target.value }))}
                        placeholder="billing-paypal@company.com"
                        className="rounded-xl"
                      />
                      <p className="text-4xs text-muted-foreground">PayPal invoice billing email for payments and refunds.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person Name</Label>
                        <Input
                          id="contactPerson"
                          value={companyData.contactPerson}
                          onChange={(e) => setCompanyData((p) => ({ ...p, contactPerson: e.target.value }))}
                          placeholder="Jane Doe"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPersonTitle">Contact Person Title</Label>
                        <Input
                          id="contactPersonTitle"
                          value={companyData.contactPersonTitle}
                          onChange={(e) => setCompanyData((p) => ({ ...p, contactPersonTitle: e.target.value }))}
                          placeholder="HR Specialist / Procurement Manager"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Address</Label>
                        <Input
                          id="companyAddress"
                          value={companyData.address}
                          onChange={(e) => setCompanyData((p) => ({ ...p, address: e.target.value }))}
                          placeholder="Company Address"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="companyCountry">Country</Label>
                        <div className="relative">
                          <Input
                            placeholder="Type to search country..."
                            value={countrySearch || companyData.country}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCountrySearch(val);
                              setCompanyData((p) => ({ ...p, country: val }));
                              setShowCountryDropdown(true);
                            }}
                            onFocus={() => {
                              setCountrySearch(companyData.country);
                              setShowCountryDropdown(true);
                            }}
                            onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                            className="rounded-xl"
                          />
                          {showCountryDropdown && (
                            <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto bg-background border border-border/80 rounded-xl shadow-lg divide-y divide-border/20">
                              {COUNTRIES.filter(c => c.toLowerCase().includes((countrySearch || "").toLowerCase())).length === 0 ? (
                                <div className="p-3 text-xs text-muted-foreground text-center">No countries found</div>
                              ) : (
                                COUNTRIES.filter(c => c.toLowerCase().includes((countrySearch || "").toLowerCase())).map((c) => (
                                  <div
                                    key={c}
                                    onClick={() => {
                                      setCompanyData((p) => ({ ...p, country: c }));
                                      setCountrySearch(c);
                                      setShowCountryDropdown(false);
                                    }}
                                    className="p-2.5 text-xs text-left hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  >
                                    {c}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Details (Company) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Company Details & Website</CardTitle>
                    <CardDescription className="text-3xs">Size, URL link, and corporate biography</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (optional)</Label>
                        <Input
                          id="website"
                          type="url"
                          value={companyData.website}
                          onChange={(e) => setCompanyData((p) => ({ ...p, website: e.target.value }))}
                          placeholder="https://example.com"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <ResponsiveSelect
                          options={[
                            { value: "1-10", label: "1-10 Employees" },
                            { value: "11-50", label: "11-50 Employees" },
                            { value: "51-200", label: "51-200 Employees" },
                            { value: "200+", label: "200+ Employees" },
                          ]}
                          value={companyData.companySize}
                          onChange={(val) => setCompanyData((p) => ({ ...p, companySize: val }))}
                          placeholder="Select size..."
                          label="Company Size"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about">About Corporate</Label>
                      <Textarea
                        id="about"
                        value={companyData.about}
                        onChange={(e) => setCompanyData((p) => ({ ...p, about: e.target.value }))}
                        placeholder="Describe your company's translation needs, business model..."
                        className="min-h-[110px] rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Company Documents & Brochure Upload (Company) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Documents & Brochure</CardTitle>
                    <CardDescription className="text-3xs">Upload company registration docs and your public brochure showcase</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    {/* Brochure Upload */}
                    <div className="p-4 rounded-xl border border-border/40 bg-accent/5 space-y-2">
                      <Label className="font-bold text-xs block">Public Company Brochure</Label>
                      <p className="text-4xs text-muted-foreground">PDF file outlining translation requirements or company history (.pdf only)</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={brochureUploading}
                          onClick={() => brochureFileInputRef.current?.click()}
                          className="rounded-xl gap-2"
                        >
                          {brochureUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {companyData.brochureUrl ? "Change Brochure File" : "Upload Brochure"}
                        </Button>
                        {companyData.brochureUrl && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-lg">
                            Brochure Uploaded
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Registration Doc */}
                      <div className="p-4 rounded-xl border border-border/40 bg-accent/5 space-y-2">
                        <Label className="font-bold text-xs block">Commercial Registration</Label>
                        <p className="text-4xs text-muted-foreground">Upload corporate registry certificate</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={regUploading}
                            onClick={() => regFileInputRef.current?.click()}
                            className="rounded-xl gap-2"
                          >
                            {regUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                            {companyData.registrationDoc ? "Change File" : "Upload File"}
                          </Button>
                          {companyData.registrationDoc && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md">
                              Uploaded
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Tax Doc */}
                      <div className="p-4 rounded-xl border border-border/40 bg-accent/5 space-y-2">
                        <Label className="font-bold text-xs block">Tax Certificate</Label>
                        <p className="text-4xs text-muted-foreground">Upload official VAT document</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={taxUploading}
                            onClick={() => taxFileInputRef.current?.click()}
                            className="rounded-xl gap-2"
                          >
                            {taxUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                            {companyData.taxDoc ? "Change File" : "Upload File"}
                          </Button>
                          {companyData.taxDoc && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md">
                              Uploaded
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO & Visibility (Company) */}
                <Card className="glass-card border-border/40 rounded-2xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Privacy & SEO Indexing</CardTitle>
                    <CardDescription className="text-3xs">Configure your public visibility parameters and search engines targeting</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pb-0 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-accent/5">
                      <div className="space-y-0.5">
                        <Label htmlFor="isPublicPlatform" className="font-bold text-xs">Public platform directory</Label>
                        <p className="text-4xs text-muted-foreground">List your company profile in the public business directory</p>
                      </div>
                      <input
                        id="isPublicPlatform"
                        type="checkbox"
                        checked={companyData.isPublicPlatform}
                        onChange={(e) => setCompanyData((prev) => ({ ...prev, isPublicPlatform: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Select permitted search engines for indexing</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Google", "Bing", "DuckDuckGo", "Yandex"].map((engine) => {
                          const checked = companyData.searchEngines.includes(engine);
                          return (
                            <div key={engine} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-background/50">
                              <input
                                id={`engine-${engine}`}
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSearchEngine(engine)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <Label htmlFor={`engine-${engine}`} className="text-3xs font-medium cursor-pointer select-none">
                                {engine}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoKeywords">SEO Keywords (Comma Separated)</Label>
                      <Input
                        id="seoKeywords"
                        value={companyData.seoKeywords}
                        onChange={(e) => setCompanyData((p) => ({ ...p, seoKeywords: e.target.value }))}
                        placeholder="translation agency, localized solutions provider, document scanning"
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bottom Actions Form */}
            <Separator />
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setViewMode(true)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {profileExists ? "Save Changes" : "Create Profile"}
              </Button>
            </div>
            {/* Language Change Request Modal */}
            {isRequestModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-background p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h3 className="text-base font-bold text-foreground">Request Language Change</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsRequestModalOpen(false)} className="h-8 w-8 p-0 rounded-lg">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select the full list of languages you wish to offer. 
                      <strong className="text-amber-600 block mt-1">⚠️ Note: Your profile verification status will be reset to unverified upon approval, and you must complete the verification process again.</strong>
                    </p>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Requested Languages (Choose via Checkboxes)</Label>
                      <div className="max-h-48 overflow-y-auto border border-border/40 rounded-xl p-3 bg-muted/20 space-y-2">
                        {LANGUAGES.map((lang) => {
                          const isChecked = requestedLanguages.includes(lang.code);
                          return (
                            <div key={lang.code} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`req-lang-${lang.code}`}
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const maxLangs = translatorData.planTier === "standard" || translatorData.planTier === "pro" ? 5 : translatorData.planTier === "plus" ? 7 : 2;
                                    if (requestedLanguages.length >= maxLangs) {
                                      toast({
                                        title: "Limit Exceeded",
                                        description: `You can only select up to ${maxLangs} languages for your plan.`,
                                        variant: "destructive"
                                      });
                                      return;
                                    }
                                    setRequestedLanguages((prev) => [...prev, lang.code]);
                                  } else {
                                    setRequestedLanguages((prev) => prev.filter((code) => code !== lang.code));
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                              <Label htmlFor={`req-lang-${lang.code}`} className="text-xs font-medium cursor-pointer select-none">
                                {lang.name}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Reason for Change (Mandatory)</Label>
                      <Textarea
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        placeholder="Please explain why you want to change your languages..."
                        rows={4}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                    <Button variant="outline" size="sm" onClick={() => setIsRequestModalOpen(false)} className="rounded-xl">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendChangeRequest}
                      disabled={submittingRequest}
                      size="sm"
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {submittingRequest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Request
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </AuthGuard>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ProfileContent />
    </React.Suspense>
  );
}
