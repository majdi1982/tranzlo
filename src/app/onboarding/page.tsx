"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { getAccount } from "@/lib/appwrite";
import { LANGUAGES } from "@/data/languages";
import { COUNTRY_CODES } from "@/data/country-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ResponsiveSelect } from "@/components/ui/responsive-select";
import { 
  User, 
  Briefcase, 
  Settings, 
  ArrowRight, 
  Check, 
  Info,
  CheckCircle,
  Globe,
  Search,
  CheckSquare,
  Square
} from "lucide-react";

const CAT_TOOLS = [
  "SDL Trados Studio",
  "MemoQ",
  "Phrase / Memsource",
  "Smartcat",
  "Wordfast",
  "OmegaT"
];

const SEARCH_ENGINES = [
  { id: "google", name: "Google Search", icon: "🌐" },
  { id: "bing", name: "Bing (Microsoft)", icon: "🔍" },
  { id: "duckduckgo", name: "DuckDuckGo", icon: "🦆" },
  { id: "yandex", name: "Yandex", icon: "🇷🇺" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useSession();
  const services = getServices();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [role, setRole] = React.useState<"translator" | "company" | null>(null);

  // Translator Form State
  const [nativeLang, setNativeLang] = React.useState("en");
  const [selectedLangs, setSelectedLangs] = React.useState<string[]>(["en", "ar"]);
  const [activePairs, setActivePairs] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState("");
  const [selectedCatTools, setSelectedCatTools] = React.useState<string[]>([]);
  const [isPublicPlatform, setIsPublicPlatform] = React.useState(true);
  const [selectedSearchEngines, setSelectedSearchEngines] = React.useState<string[]>(["google"]);
  const [seoKeywordsInput, setSeoKeywordsInput] = React.useState("");
  const [seoKeywords, setSeoKeywords] = React.useState<string[]>([]);

  // Company Form State
  const [companyName, setCompanyName] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [companySize, setCompanySize] = React.useState("1-10");
  const [about, setAbout] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);

  // Set initial role if already chosen in signup or session preferences
  React.useEffect(() => {
    if (user?.prefs?.role) {
      setRole(user.prefs.role as any);
    }
  }, [user]);

  // Handle SEO Keywords adding
  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && seoKeywordsInput.trim()) {
      e.preventDefault();
      const clean = seoKeywordsInput.trim().toLowerCase();
      if (!seoKeywords.includes(clean)) {
        setSeoKeywords([...seoKeywords, clean]);
      }
      setSeoKeywordsInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== kw));
  };

  // Profile completion progress calculation
  const getProgress = () => {
    if (step === 1 && !role) return 20; // 20% base for registration
    if (step === 1 && role) return 40; // 20% registration + 20% role selection

    let score = 40; // 20% registration + 20% role selection
    if (role === "translator") {
      if (selectedLangs.length > 0) score += 20; // +20% Selected Languages
      if (activePairs.length > 0) score += 15; // +15% pricing / language pairs
      if (bio.trim().length > 10) score += 15; // +15% bio
      if (selectedCatTools.length > 0) score += 15; // +15% CAT Tools
      if (seoKeywords.length > 0 || !isPublicPlatform) score += 10; // +10% SEO Settings
    } else if (role === "company") {
      if (companyName.trim()) score += 20; // +20% Company Name
      if (website.trim()) score += 20; // +20% Website
      if (about.trim().length > 10) score += 20; // +20% Description
      if (companySize) score += 20; // +20% Size/Vertical
    }
    return Math.min(score, 100);
  };

  const handleToggleSearchEngine = (id: string) => {
    if (selectedSearchEngines.includes(id)) {
      setSelectedSearchEngines(selectedSearchEngines.filter((s) => s !== id));
    } else {
      setSelectedSearchEngines([...selectedSearchEngines, id]);
    }
  };

  const handleToggleCatTool = (tool: string) => {
    if (selectedCatTools.includes(tool)) {
      setSelectedCatTools(selectedCatTools.filter((t) => t !== tool));
    } else {
      setSelectedCatTools([...selectedCatTools, tool]);
    }
  };

  const checkMailingListAutoSubscribe = async (userRole: string) => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("oauth_signup_autosubscribe") === "true") {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user?.email,
            name: user?.name,
            role: userRole,
          }),
        });
        localStorage.removeItem("oauth_signup_autosubscribe");
      }
    } catch (err) {
      console.error("Auto subscribe error:", err);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!role) return;
    setSubmitting(true);
    try {
      // 1. Update user preferences role in Appwrite auth account
      const account = getAccount();
      await account.updatePrefs({ role });

      // 2. Save profile data in DB
      if (role === "translator") {
        if (selectedLangs.length !== 2) {
          toast({
            title: "Required Languages Count Not Met",
            description: "You must select exactly 2 languages to complete your translator profile onboarding.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
        await services.profile.updateTranslatorProfile(user?.$id || "", {
          fullName: user?.name || "Linguist Pro",
          email: user?.email || "",
          languages: selectedLangs,
          nativeLanguage: nativeLang,
          languagePairs: JSON.stringify(
            activePairs.map((p) => {
              const [src, tgt] = p.split("-");
              return { source: src, target: tgt, level: "advanced" };
            })
          ) as any,
          hourlyRate: 0,
          bio: bio || "Professional language specialist.",
          phone,
          catTools: selectedCatTools,
          isPublicPlatform,
          searchEngines: selectedSearchEngines,
          seoKeywords: seoKeywords.join(", "),
          onboardingComplete: true,
          completedJobs: 0,
          rating: 0,
          ratingCount: 0,
          isApproved: true,
          status: "active"
        });
      } else {
        await services.profile.updateCompanyProfile(user?.$id || "", {
          companyName: companyName || "Enterprise Corp",
          fullName: user?.name || "Corporate Client",
          contactPerson: user?.name || "Director",
          email: user?.email || "",
          phone,
          website,
          companySize,
          about: about || "Enterprise service entity.",
          isPublicPlatform,
          searchEngines: selectedSearchEngines,
          seoKeywords: seoKeywords.join(", "),
          onboardingComplete: true,
          isApproved: true,
          status: "active"
        });
      }

      await refreshUser();
      await checkMailingListAutoSubscribe(role);
      toast({
        title: "Setup Complete!",
        description: "Welcome to Tranzlo! Your profile has been updated.",
        variant: "success"
      });

      // Redirect to correct dashboard
      router.replace(role === "translator" ? "/dashboard/translator" : "/dashboard/company");
    } catch (err: any) {
      toast({
        title: "Setup Failed",
        description: err.message || "Something went wrong saving your profile.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    const targetRole = role || "translator";
    try {
      // 1. Update user preferences role in Appwrite auth account
      const account = getAccount();
      await account.updatePrefs({ role: targetRole });

      // 2. Save an empty profile with onboardingComplete: true and isPublicPlatform: false (private by default)
      if (targetRole === "translator") {
        await services.profile.updateTranslatorProfile(user?.$id || "", {
          fullName: user?.name || "Linguist Pro",
          email: user?.email || "",
          languages: [],
          specializations: [],
          hourlyRate: 0,
          bio: "",
          catTools: [],
          isPublicPlatform: false,
          searchEngines: [],
          seoKeywords: "",
          onboardingComplete: true,
          completedJobs: 0,
          rating: 0,
          ratingCount: 0,
          isApproved: true,
          status: "active"
        });
      } else {
        await services.profile.updateCompanyProfile(user?.$id || "", {
          companyName: user?.name || "Enterprise Corp",
          fullName: user?.name || "Corporate Client",
          contactPerson: user?.name || "Director",
          email: user?.email || "",
          website: "",
          companySize: "1-10",
          about: "",
          isPublicPlatform: false,
          searchEngines: [],
          seoKeywords: "",
          onboardingComplete: true,
          isApproved: true,
          status: "active"
        });
      }

      await refreshUser();
      await checkMailingListAutoSubscribe(targetRole);
      router.replace(targetRole === "translator" ? "/dashboard/translator" : "/dashboard/company");
    } catch (err: any) {
      toast({
        title: "Setup Failed",
        description: err.message || "Failed to skip onboarding and save profile.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = getProgress();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center py-16 px-4 bg-grid relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-hero-glow pointer-events-none" />

      {/* Floating Circular Progress Widget */}
      <div className="fixed top-6 right-6 z-50 glass-card bg-card/85 backdrop-blur-md border border-border rounded-2xl p-4 flex items-center gap-3 shadow-xl">
        <div className="relative h-12 w-12 flex items-center justify-center">
          <svg className="absolute transform -rotate-90 w-full h-full">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="text-xs font-semibold text-primary">{progressPercent}%</span>
        </div>
        <div>
          <div className="text-xs font-medium text-foreground">Profile completion</div>
          <div className="text-[10px] text-muted-foreground">Increases hiring rates by up to 85%</div>
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {step === 1 ? (
          <Card className="glass-card bg-card/30 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                <Settings className="h-6 w-6 text-primary animate-spin-slow" />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
                Let's Customize Your Experience
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-base">
                How would you like to use Tranzlo? Choose your role below.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("translator")}
                className={`flex flex-col items-center text-center gap-3 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                  role === "translator"
                    ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5"
                    : "border-border hover:border-primary/50 bg-card/40 hover:bg-card/60"
                }`}
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                  role === "translator" ? "bg-primary/20 text-cyan-400" : "bg-muted text-muted-foreground"
                }`}>
                  <Briefcase className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold">Linguist / Translator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Offer professional translation services, set your own pricing, and connect with global organizations.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("company")}
                className={`flex flex-col items-center text-center gap-3 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                  role === "company"
                    ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5"
                    : "border-border hover:border-primary/50 bg-card/40 hover:bg-card/60"
                }`}
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                  role === "company" ? "bg-primary/20 text-cyan-400" : "bg-muted text-muted-foreground"
                }`}>
                  <User className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold">Employer / Company</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Post dynamic translation jobs, review linguists, hire certified specialists, and manage localization tasks.
                </p>
              </button>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 border-t border-border mt-4">
              <Button variant="ghost" onClick={handleSkip} className="hover:bg-muted/50">
                Skip for now
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!role}
                className="rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium"
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="glass-card bg-card/30 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl">
            <CardHeader className="border-b border-border pb-6 mb-6">
              <CardTitle className="text-2xl font-bold">
                {role === "translator" ? "Linguist Profile Details" : "Company Profile Details"}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Tell us about yourself to increase your platform visibility and matches.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {role === "translator" ? (
                // Translator Specific Form Fields
                <div className="space-y-6">
                  {/* Language Profile Setup */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Native Language (Max 1)</Label>
                      <ResponsiveSelect
                        options={LANGUAGES.map(l => ({ value: l.code, label: l.name }))}
                        value={nativeLang}
                        onChange={setNativeLang}
                        placeholder="Select Native Language"
                        searchPlaceholder="Search language..."
                        label="Native Language"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-semibold">Languages Spoken/Written (Max 2)</Label>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold uppercase">Free Tier Cap</span>
                      </div>
                      <ResponsiveSelect
                        options={LANGUAGES.map((lang) => ({
                          value: lang.code,
                          label: lang.name,
                        }))}
                        value={selectedLangs}
                        onChange={(selectedCodes: string[]) => {
                          if (selectedCodes.length > 2) {
                            toast({ title: "Free plan is limited to 2 languages.", variant: "destructive" });
                            return;
                          }
                          setSelectedLangs(selectedCodes);
                          
                          // Auto suggest pairs when languages update
                          const newPairs: string[] = [];
                          selectedCodes.forEach(src => {
                            selectedCodes.forEach(tgt => {
                              if (src !== tgt) {
                                newPairs.push(`${src}-${tgt}`);
                              }
                            });
                          });
                          setActivePairs(newPairs);
                        }}
                        multiple={true}
                        placeholder="Select languages (Max 2)"
                        searchPlaceholder="Search language..."
                        label="Languages Spoken/Written"
                      />
                    </div>

                    {/* Dynamic Language Pairs List */}
                    {selectedLangs.length > 0 && (
                      <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-foreground">Select Working Language Pairs</Label>
                          <p className="text-[10px] text-muted-foreground">Select the specific translation pairs you want to activate and verify in your profile.</p>
                        </div>
                        {selectedLangs.length < 2 ? (
                          <div className="text-2xs text-amber-600 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg font-medium">
                            ⚠️ Please select at least 2 working languages above to configure and select translation pairs.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(() => {
                              const pairsList: { id: string; label: string }[] = [];
                              selectedLangs.forEach(src => {
                                selectedLangs.forEach(tgt => {
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
                                const isActive = activePairs.includes(pair.id);
                                return (
                                  <div
                                    key={pair.id}
                                    onClick={() => {
                                      if (isActive) {
                                        setActivePairs(activePairs.filter(p => p !== pair.id));
                                      } else {
                                        setActivePairs([...activePairs, pair.id]);
                                      }
                                    }}
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
                  </div>



                  {/* CAT Tools Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">CAT Tools Proficiency</Label>
                    <ResponsiveSelect
                      options={CAT_TOOLS.map((tool) => ({ value: tool, label: tool }))}
                      value={selectedCatTools}
                      onChange={setSelectedCatTools}
                      placeholder="Select CAT Tools..."
                      searchPlaceholder="Search tools..."
                      multiple={true}
                      label="CAT Tools"
                    />
                  </div>

                  {/* Professional Summary */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-semibold">Professional Summary / Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Write a brief professional summary describing your experience, tools, and background..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="bg-background rounded-md resize-none"
                    />
                  </div>
                </div>
              ) : (
                // Company Specific Form Fields
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-semibold">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Tranzlo Enterprise"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-background rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-semibold">Corporate Website URL</Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-background rounded-md"
                    />
                  </div>



                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Company Size</Label>
                    <ResponsiveSelect
                      options={[
                        { value: "1-10", label: "1-10 Employees (Startup)" },
                        { value: "11-50", label: "11-50 Employees (SME)" },
                        { value: "51-200", label: "51-200 Employees (Medium)" },
                        { value: "201+", label: "201+ Employees (Enterprise)" }
                      ]}
                      value={companySize}
                      onChange={setCompanySize}
                      placeholder="Select Company Size"
                      label="Company Size"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about" className="text-sm font-semibold">About the Company</Label>
                    <Textarea
                      id="about"
                      placeholder="Introduce your company and vertical market to attract the best matching linguists..."
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={4}
                      className="bg-background rounded-md resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Shared Platform Visibility and SEO Indexing Controls */}
              <div className="border-t border-border pt-6 mt-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Privacy & Search Engine Indexing Settings</h3>
                
                {/* Internal Directory Toggle */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <Globe className="h-4 w-4 text-cyan-400" />
                      Publish profile inside Tranzlo platform directory?
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If enabled, your profile will be publicly searchable by other users inside our verified directory.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublicPlatform(!isPublicPlatform)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${
                      isPublicPlatform ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                        isPublicPlatform ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* External Search Engine Selector Box */}
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/80 bg-muted/20">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <Search className="h-4 w-4 text-cyan-400" />
                      Publish on external Search Engines?
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select which search engines are permitted to index and index your profile.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    {SEARCH_ENGINES.map((engine) => {
                      const active = selectedSearchEngines.includes(engine.id);
                      return (
                        <button
                          key={engine.id}
                          type="button"
                          onClick={() => handleToggleSearchEngine(engine.id)}
                          className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-semibold transition-all ${
                            active
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border hover:border-primary/50 text-muted-foreground"
                          }`}
                        >
                          <span className="text-base">{engine.icon}</span>
                          <span className="flex-1 text-left text-xs">{engine.name}</span>
                          {active ? (
                            <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom SEO Keywords - dynamic expand based on search engine selection */}
                  {selectedSearchEngines.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2 animate-fade-in">
                      <Label htmlFor="keywords" className="text-xs font-bold text-foreground">
                        Enter custom SEO keywords to boost your ranking on selected engines
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Type a keyword and press **Enter** (e.g. *{role === "company" ? "translation company" : "technical translator"}*).
                      </p>
                      
                      <Input
                        id="keywords"
                        placeholder="Type keyword and press Enter..."
                        value={seoKeywordsInput}
                        onChange={(e) => setSeoKeywordsInput(e.target.value)}
                        onKeyDown={handleAddKeyword}
                        className="bg-background rounded-md h-9 text-xs"
                      />

                      {seoKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {seoKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="inline-flex items-center gap-1 bg-muted border border-border px-2 py-0.5 rounded text-[10px] font-semibold text-foreground"
                            >
                              {kw}
                              <button
                                type="button"
                                onClick={() => handleRemoveKeyword(kw)}
                                className="text-muted-foreground hover:text-destructive transition-colors ml-1 font-bold text-xs"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border mt-4 pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="hover:bg-muted/50"
              >
                Back
              </Button>
              <Button
                onClick={handleFinishOnboarding}
                disabled={submitting}
                className="rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
              >
                {submitting ? "Saving Profile..." : "Complete Setup"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
