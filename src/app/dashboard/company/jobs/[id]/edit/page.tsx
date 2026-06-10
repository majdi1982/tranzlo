"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FileText, Globe, Loader2, Plus, Send, TestTube, X, Upload, Search } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LANGUAGES } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";
import { COUNTRIES } from "@/data/countries";
import { SERVICE_TYPES, SERVICE_UNITS } from "@/data/service-types";
import { CAT_TOOLS } from "@/data/cat-tools";
import { createJobSchema } from "@/validators";
import { getStorage, ID, BUCKETS } from "@/lib/appwrite";
import type { TranslatorProfile } from "@/types";

interface SearchableLanguageSelectProps {
  id: string;
  placeholder: string;
  selected: string[];
  onSelect: (code: string) => void;
}

function SearchableLanguageSelect({ id, placeholder, selected, onSelect }: SearchableLanguageSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
      >
        <span className="text-muted-foreground">{placeholder}</span>
        <span className="h-4 w-4 opacity-50 flex items-center justify-center">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none mt-1 p-1 max-h-[300px] flex flex-col bg-background">
          <div className="flex items-center border-b px-3 py-2 gap-2">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-[220px] py-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No language found.</div>
            ) : (
              filtered.map((lang) => {
                const isSelected = selected.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    disabled={isSelected}
                    onClick={() => {
                      onSelect(lang.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lang.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchableSpecializationSelectProps {
  id: string;
  placeholder: string;
  selected: string[];
  onSelect: (value: string) => void;
}

function SearchableSpecializationSelect({ id, placeholder, selected, onSelect }: SearchableSpecializationSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = SPECIALIZATIONS.filter((spec) =>
    spec.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
      >
        <span className="text-muted-foreground">{placeholder}</span>
        <span className="h-4 w-4 opacity-50 flex items-center justify-center">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none mt-1 p-1 max-h-[300px] flex flex-col bg-background">
          <div className="flex items-center border-b px-3 py-2 gap-2">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-[220px] py-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No specialization found.</div>
            ) : (
              filtered.map((spec) => {
                const isSelected = selected.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    disabled={isSelected}
                    onClick={() => {
                      onSelect(spec);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {spec}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchableCatToolSelectProps {
  id: string;
  placeholder: string;
  selected: string[];
  onSelect: (value: string) => void;
}

function SearchableCatToolSelect({ id, placeholder, selected, onSelect }: SearchableCatToolSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = CAT_TOOLS.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
      >
        <span className="text-muted-foreground">{placeholder}</span>
        <span className="h-4 w-4 opacity-50 flex items-center justify-center">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none mt-1 p-1 max-h-[300px] flex flex-col bg-background">
          <div className="flex items-center border-b px-3 py-2 gap-2">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search CAT tool..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-[220px] py-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No CAT tool found.</div>
            ) : (
              filtered.map((tool) => {
                const isSelected = selected.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    disabled={isSelected}
                    onClick={() => {
                      onSelect(tool.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tool.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const AI_REVIEWERS = [
  { id: "gpt4o", name: "GPT-4o Reviewer", rate: 0.005, description: "Highly accurate linguistic analysis and feedback." },
  { id: "claude", name: "Claude 3.5 Sonnet Reviewer", rate: 0.008, description: "Outstanding style, natural flow, and premium review quality." },
  { id: "deepseek", name: "DeepSeek-V3 Reviewer", rate: 0.003, description: "Fast, cost-efficient, and solid translation review." },
  { id: "llama", name: "Llama-3.1-405B Reviewer", rate: 0.004, description: "Open-weights intelligence, strong formatting checking." },
];

interface ServiceRow {
  serviceId: string;
  quantity: number;
  unit: string;
  rate: number;
  rateMin: number;
  rateMax: number;
  isFixed: boolean;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sourceLanguages, setSourceLanguages] = React.useState<string[]>([]);
  const [targetLanguages, setTargetLanguages] = React.useState<string[]>([]);
  const [country, setCountry] = React.useState("");
  const [workType, setWorkType] = React.useState<"onsite" | "online" | "hybrid">("online");
  const [deadline, setDeadline] = React.useState("");
  const [specializations, setSpecializations] = React.useState<string[]>([]);
  const [services, setServices] = React.useState<ServiceRow[]>([
    { serviceId: "translation", quantity: 1000, unit: "word", rate: 0.08, rateMin: 0.04, rateMax: 0.08, isFixed: true }
  ]);
  const [requiredCatTools, setRequiredCatTools] = React.useState<string[]>([]);
  const [testFileUrl, setTestFileUrl] = React.useState("");
  const [testDuration, setTestDuration] = React.useState("24");
  const [testWordCount, setTestWordCount] = React.useState("150");
  const [maxApplicants, setMaxApplicants] = React.useState("");
  const [testUploading, setTestUploading] = React.useState(false);
  const testFileInputRef = React.useRef<HTMLInputElement>(null);
  const [reviewerType, setReviewerType] = React.useState<"company" | "translator">("company");
  const [selectedAiReviewer, setSelectedAiReviewer] = React.useState("gpt4o");
  const [budgetMin, setBudgetMin] = React.useState("50");
  const [budgetMax, setBudgetMax] = React.useState("300");
  const [requiresTest, setRequiresTest] = React.useState(true);
  const [externalTranslatorEmail, setExternalTranslatorEmail] = React.useState("");
  const [previousTranslatorId, setPreviousTranslatorId] = React.useState("");
  
  // Visibility and Translation File State
  const [visibility, setVisibility] = React.useState<"public" | "private">("public");
  const [privateType, setPrivateType] = React.useState<"internal" | "external">("internal");
  const [translationFileUrl, setTranslationFileUrl] = React.useState("");
  const [translationFileUploading, setTranslationFileUploading] = React.useState(false);
  const translationFileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [suggestedTranslators, setSuggestedTranslators] = React.useState<(TranslatorProfile & { hasWorkedBefore: boolean })[]>([]);
  const [selectedTranslators, setSelectedTranslators] = React.useState<string[]>([]);
  const [loadingTranslators, setLoadingTranslators] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!params?.id) return;
    const svc = getServices();
    svc.job.getJob(params.id).then((job) => {
      if (job) {
        setTitle(job.title);
        setDescription(job.description);
        if (job.maxApplicants) setMaxApplicants(job.maxApplicants.toString());
        setSourceLanguages(job.sourceLanguage.split(", "));
        setTargetLanguages(job.targetLanguage.split(", "));
        setWorkType(job.workType as any);
        if (job.country) setCountry(job.country);
        setDeadline(job.deadline);
        if (job.specializations) setSpecializations(job.specializations);
        try {
          const parsedServices = typeof job.services === "string" ? JSON.parse(job.services) : job.services;
          if (Array.isArray(parsedServices) && parsedServices.length > 0) {
            setServices(parsedServices);
          }
        } catch(e) {}
        if (job.requiredCatTools) setRequiredCatTools(job.requiredCatTools);
        setRequiresTest(job.requiresTest ?? true);
        if (job.testFileUrl) setTestFileUrl(job.testFileUrl);
        if (job.testDuration) setTestDuration(job.testDuration.toString());
        if (job.testWordCount) setTestWordCount(job.testWordCount.toString());
        if (job.reviewerType) setReviewerType(job.reviewerType as any);
        if (job.externalTranslatorEmail) setExternalTranslatorEmail(job.externalTranslatorEmail);
        if (job.previousTranslatorId) setPreviousTranslatorId(job.previousTranslatorId);
        if (job.visibility) setVisibility(job.visibility as any);
        if (job.privateType) setPrivateType(job.privateType as any);
        if (job.translationFileUrl) setTranslationFileUrl(job.translationFileUrl);
      }
    }).catch((err) => {
      toast({ title: "Failed to load job", description: err.message, variant: "destructive" });
    });
  }, [params?.id, toast]);

  React.useEffect(() => {
    if (visibility === "private" && privateType === "internal" && sourceLanguages.length > 0 && targetLanguages.length > 0) {
      setLoadingTranslators(true);
      const svc = getServices();
      svc.profile.getSuggestedTranslators(sourceLanguages, targetLanguages, specializations, user?.$id || "").then(res => {
        setSuggestedTranslators(res);
      }).catch(err => {
        console.error("Failed to load suggested translators", err);
        setSuggestedTranslators([]);
      }).finally(() => setLoadingTranslators(false));
    } else {
      setSuggestedTranslators([]);
    }
  }, [visibility, privateType, sourceLanguages, targetLanguages, specializations, user?.$id]);

  const availableServiceTypes = SERVICE_TYPES.filter(
    (s) => !services.find((r) => r.serviceId === s.id)
  );

  function addService() {
    if (availableServiceTypes.length === 0) return;
    const first = availableServiceTypes[0];
    setServices([...services, {
      serviceId: first.id,
      quantity: 1000,
      unit: first.unit,
      rate: first.unit === "word" ? 0.08 : 25.00,
      rateMin: first.unit === "word" ? 0.04 : 15.00,
      rateMax: first.unit === "word" ? 0.08 : 30.00,
      isFixed: true
    }]);
  }

  function removeService(idx: number) {
    setServices(services.filter((_, i) => i !== idx));
  }

  function updateService(idx: number, field: keyof ServiceRow, value: any) {
    setServices(services.map((s, i) => {
      if (i !== idx) return s;
      const next = { ...s, [field]: value };
      if (field === "serviceId") {
        const svc = SERVICE_TYPES.find((st) => st.id === value);
        next.unit = svc?.unit ?? "word";
        next.rate = next.unit === "word" ? 0.08 : 25.00;
        next.rateMin = next.unit === "word" ? 0.04 : 15.00;
        next.rateMax = next.unit === "word" ? 0.08 : 30.00;
      }
      return next;
    }));
  }

  function toggleSpecialization(spec: string) {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  }

  function toggleCatTool(toolId: string) {
    setRequiredCatTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  }

  const selectedReviewerRate = React.useMemo(() => {
    if (reviewerType !== "translator") return 0;
    const found = AI_REVIEWERS.find((r) => r.id === selectedAiReviewer);
    return found ? found.rate : 0;
  }, [reviewerType, selectedAiReviewer]);

  const totalBudgetMin = React.useMemo(() => {
    const baseCost = services.reduce((sum, s) => {
      const val = s.isFixed ? s.rate : s.rateMin;
      return sum + s.quantity * val;
    }, 0);
    const totalWords = services.reduce((sum, s) => sum + (s.unit === "word" ? s.quantity : 0), 0);
    const aiReviewCost = totalWords * selectedReviewerRate;
    return baseCost + aiReviewCost;
  }, [services, selectedReviewerRate]);

  const totalBudgetMax = React.useMemo(() => {
    const baseCost = services.reduce((sum, s) => {
      const val = s.isFixed ? s.rate : s.rateMax;
      return sum + s.quantity * val;
    }, 0);
    const totalWords = services.reduce((sum, s) => sum + (s.unit === "word" ? s.quantity : 0), 0);
    const aiReviewCost = totalWords * selectedReviewerRate;
    return baseCost + aiReviewCost;
  }, [services, selectedReviewerRate]);

  async function handleTestUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestUploading(true);
    try {
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.COMPANY_DOCUMENTS, ID.unique(), file);
      const fileUrl = storage.getFileView(BUCKETS.COMPANY_DOCUMENTS, uploaded.$id).toString();
      setTestFileUrl(fileUrl);
      toast({ title: "Test file uploaded successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to upload test file", variant: "destructive" });
    } finally {
      setTestUploading(false);
      if (testFileInputRef.current) testFileInputRef.current.value = "";
    }
  }

  async function handleTranslationFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTranslationFileUploading(true);
    try {
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.COMPANY_DOCUMENTS, ID.unique(), file);
      const fileUrl = storage.getFileView(BUCKETS.COMPANY_DOCUMENTS, uploaded.$id).toString();
      setTranslationFileUrl(fileUrl);
      toast({ title: "Translation file uploaded successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to upload translation file", variant: "destructive" });
    } finally {
      setTranslationFileUploading(false);
      if (translationFileInputRef.current) translationFileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
 
    if (requiresTest) {
      if (!testFileUrl) {
        setErrors((prev) => ({ ...prev, testFile: "Test file is required." }));
        toast({ title: "Please upload a test document", variant: "destructive" });
        return;
      }
      if (!testDuration || Number(testDuration) <= 0) {
        setErrors((prev) => ({ ...prev, testDuration: "Test duration must be a positive number." }));
        return;
      }
      if (!testWordCount || Number(testWordCount) <= 0 || Number(testWordCount) > 250) {
        setErrors((prev) => ({ ...prev, testWordCount: "Word count must be between 1 and 250 words." }));
        return;
      }
    }
 
    const finalBudgetMin = Math.round(totalBudgetMin);
    const finalBudgetMax = Math.round(totalBudgetMax);
 
    if (finalBudgetMin < 0 || finalBudgetMax < 0) {
      toast({ title: "Total budget cannot be negative. Please check service rates.", variant: "destructive" });
      return;
    }
    
    if (!translationFileUrl) {
      setErrors((prev) => ({ ...prev, translationFile: "Translation file is required." }));
      toast({ title: "Please upload the translation file", variant: "destructive" });
      return;
    }

    const formData = {
      title,
      description,
      maxApplicants: maxApplicants ? Number(maxApplicants) : undefined,
      sourceLanguage: sourceLanguages.join(", "),
      targetLanguage: targetLanguages.join(", "),
      country: (workType === "onsite" || workType === "hybrid") ? country : undefined,
      workType,
      budget: finalBudgetMax,
      budgetMin: finalBudgetMin,
      budgetMax: finalBudgetMax,
      deadline,
      specializations,
      services: services.map((s) => ({
        serviceId: s.serviceId,
        quantity: s.quantity,
        unit: s.unit,
        rate: s.isFixed ? s.rate : undefined,
        rateMin: !s.isFixed ? s.rateMin : undefined,
        rateMax: !s.isFixed ? s.rateMax : undefined,
        isFixed: s.isFixed
      })),
      requiredCatTools: requiredCatTools.length > 0 ? requiredCatTools : undefined,
      requiresTest,
      testFileUrl: requiresTest ? testFileUrl : undefined,
      testDuration: requiresTest ? Number(testDuration) : undefined,
      testWordCount: requiresTest ? Number(testWordCount) : undefined,
      reviewerType,
      externalTranslatorEmail: externalTranslatorEmail || undefined,
      previousTranslatorId: previousTranslatorId || undefined,
      visibility,
      privateType: visibility === "private" ? privateType : undefined,
      translationFileUrl,
      invitedTranslators: visibility === "private" && privateType === "internal" ? selectedTranslators : undefined,
    };
 
    const parsed = createJobSchema.partial().safeParse(formData);
 
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
 
    if ((workType === "onsite" || workType === "hybrid") && !country) {
      setErrors((prev) => ({ ...prev, country: "Country is required for physical location jobs" }));
      return;
    }
 
    setSaving(true);
    try {
      const svc = getServices();
      await svc.job.updateJob(params.id, {
        ...parsed.data,
        services: JSON.stringify(parsed.data.services) as any,
        budget: finalBudgetMax,
        budgetMin: finalBudgetMin,
        budgetMax: finalBudgetMax,
      });
      toast({ title: "Job updated successfully!", variant: "success" });
      router.push("/dashboard/company");
    } catch (err: any) {
      console.error("Failed to update job error:", err);
      toast({ 
        title: "Failed to update job", 
        description: err?.message || "An unknown error occurred while updating the job", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["company"]}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Job</h1>
              <p className="text-muted-foreground">Update your translation project</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Visibility</CardTitle>
                  <CardDescription>Determine who can see and apply for this job</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="visibility" value="public" checked={visibility === "public"} onChange={() => setVisibility("public")} className="h-4 w-4" />
                      <span className="font-medium">Public</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="visibility" value="private" checked={visibility === "private"} onChange={() => setVisibility("private")} className="h-4 w-4" />
                      <span className="font-medium">Private</span>
                    </label>
                  </div>

                  {visibility === "private" && (
                    <div className="pt-2 border-t border-border/50">
                      <Label className="mb-3 block text-muted-foreground">Private Invitation Type</Label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="privateType" value="internal" checked={privateType === "internal"} onChange={() => setPrivateType("internal")} className="h-4 w-4" />
                          <span className="text-sm">Internal - Invite platform translators</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="privateType" value="external" checked={privateType === "external"} onChange={() => setPrivateType("external")} className="h-4 w-4" />
                          <span className="text-sm">External - Invite via Email</span>
                        </label>
                      </div>

                      {privateType === "external" && (
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="externalEmail">Translator Email</Label>
                          <Input id="externalEmail" type="email" value={externalTranslatorEmail} onChange={(e) => setExternalTranslatorEmail(e.target.value)} placeholder="translator@example.com" />
                        </div>
                      )}
                      {privateType === "internal" && (
                        <div className="mt-4 space-y-4">
                          <Label>Suggested Translators</Label>
                          {sourceLanguages.length === 0 || targetLanguages.length === 0 ? (
                            <div className="p-4 border rounded-md bg-muted/20">
                              <p className="text-sm text-muted-foreground text-center">Please select at least one source and target language first.</p>
                            </div>
                          ) : loadingTranslators ? (
                            <div className="flex items-center justify-center p-8 border rounded-md">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : suggestedTranslators.length === 0 ? (
                            <div className="p-4 border rounded-md bg-muted/20 text-center">
                              <p className="text-sm text-muted-foreground">No translators found matching your language requirements.</p>
                            </div>
                          ) : (
                            <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                              {suggestedTranslators.map(translator => (
                                <label key={translator.userId} className="flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                                  <input 
                                    type="checkbox" 
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                                    checked={selectedTranslators.includes(translator.userId)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedTranslators(prev => [...prev, translator.userId]);
                                      } else {
                                        setSelectedTranslators(prev => prev.filter(id => id !== translator.userId));
                                      }
                                    }}
                                  />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">{translator.fullName}</span>
                                      {translator.hasWorkedBefore && (
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] py-0 px-1.5 h-4 flex items-center gap-1">
                                          <span className="text-[10px]">⭐</span> Previous Hire
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {translator.languages.slice(0, 4).map(l => (
                                        <span key={l} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{l}</span>
                                      ))}
                                      {translator.languages.length > 4 && <span className="text-[10px] text-muted-foreground">+{translator.languages.length - 4} more</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">★ {translator.rating?.toFixed(1) || "New"}</span>
                                      <span>{translator.completedJobs} jobs</span>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>Basic information about the project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Localization - English to Arabic" />
                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the project scope, requirements, and any specific instructions..." className="min-h-[140px]" />
                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <Label className="block mb-2 font-semibold">Upload Translation File</Label>
                    <p className="text-xs text-muted-foreground mb-4">
                      This is the actual source document that needs translation. It will remain hidden and automatically sent to the translator in the chat only after you officially hire them.
                    </p>
                    <div className="flex flex-col gap-2">
                      <input type="file" ref={translationFileInputRef} onChange={handleTranslationFileUpload} className="hidden" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx" />
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => translationFileInputRef.current?.click()} disabled={translationFileUploading}>
                          {translationFileUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          {translationFileUrl ? "Change Translation File" : "Upload Translation File"}
                        </Button>
                        {translationFileUrl && <span className="text-xs text-success font-medium">File attached</span>}
                      </div>
                      {errors.translationFile && <p className="text-xs text-destructive mt-1">{errors.translationFile}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Language & Location</CardTitle>
                  <CardDescription>Source and target language details</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sourceLanguageSelect">Source Languages</Label>
                    <SearchableLanguageSelect
                      id="sourceLanguageSelect"
                      placeholder="Add source language..."
                      selected={sourceLanguages}
                      onSelect={(val) => {
                        if (val && !sourceLanguages.includes(val)) {
                          setSourceLanguages([...sourceLanguages, val]);
                        }
                      }}
                    />
                    
                    {sourceLanguages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {sourceLanguages.map((code) => {
                          const lang = LANGUAGES.find((l) => l.code === code);
                          return (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="text-xs py-1 px-2 flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors animate-fade-in"
                              onClick={() => setSourceLanguages(sourceLanguages.filter((c) => c !== code))}
                            >
                              <span>{lang?.name ?? code}</span>
                              <X className="h-3 w-3" />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    {errors.sourceLanguage && <p className="text-xs text-destructive mt-1">{errors.sourceLanguage}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetLanguageSelect">Target Languages</Label>
                    <SearchableLanguageSelect
                      id="targetLanguageSelect"
                      placeholder="Add target language..."
                      selected={targetLanguages}
                      onSelect={(val) => {
                        if (val && !targetLanguages.includes(val)) {
                          setTargetLanguages([...targetLanguages, val]);
                        }
                      }}
                    />
                    
                    {targetLanguages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {targetLanguages.map((code) => {
                          const lang = LANGUAGES.find((l) => l.code === code);
                          return (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="text-xs py-1 px-2 flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors animate-fade-in"
                              onClick={() => setTargetLanguages(targetLanguages.filter((c) => c !== code))}
                            >
                              <span>{lang?.name ?? code}</span>
                              <X className="h-3 w-3" />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    {errors.targetLanguage && <p className="text-xs text-destructive mt-1">{errors.targetLanguage}</p>}
                  </div>

                  <div className="space-y-3 sm:col-span-2">
                    <Label>Work Type</Label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="workType" value="online" checked={workType === "online"} onChange={() => setWorkType("online")} className="h-4 w-4" />
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Online (Remote)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="workType" value="onsite" checked={workType === "onsite"} onChange={() => setWorkType("onsite")} className="h-4 w-4" />
                        <span className="text-sm">On-site (In Person)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="workType" value="hybrid" checked={workType === "hybrid"} onChange={() => setWorkType("hybrid")} className="h-4 w-4" />
                        <span className="text-sm">Hybrid (Both Remote & On-site)</span>
                      </label>
                    </div>
                  </div>

                  {(workType === "onsite" || workType === "hybrid") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={country.includes(" - ") ? country.split(" - ")[0] : country} onValueChange={(val) => {
                          const addr = country.includes(" - ") ? country.split(" - ").slice(1).join(" - ") : "";
                          setCountry(addr ? `${val} - ${addr}` : val);
                        }}>
                          <SelectTrigger id="country"><SelectValue placeholder="Select country" /></SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Physical Location / Office Address (Optional)</Label>
                        <Input
                          id="location"
                          placeholder="e.g. Riyadh Office, Building A, Floor 2"
                          value={country.includes(" - ") ? country.split(" - ").slice(1).join(" - ") : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const baseCountry = country.includes(" - ") ? country.split(" - ")[0] : country;
                            setCountry(val ? `${baseCountry} - ${val}` : baseCountry);
                          }}
                          className="rounded-xl border-border/50"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {visibility === "public" && (
              <Card>
                <CardHeader>
                  <CardTitle>Specializations</CardTitle>
                  <CardDescription>Select the expertise areas required for this project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specializationSelect">Add Specialization</Label>
                    <SearchableSpecializationSelect
                      id="specializationSelect"
                      placeholder="Choose a specialization..."
                      selected={specializations}
                      onSelect={(val) => {
                        if (val && !specializations.includes(val)) {
                          setSpecializations([...specializations, val]);
                        }
                      }}
                    />
                  </div>

                  {specializations.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Selected Specializations</Label>
                      <div className="flex flex-wrap gap-2">
                        {specializations.map((spec) => (
                          <Badge
                            key={spec}
                            variant="default"
                            className="text-sm py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => toggleSpecialization(spec)}
                          >
                            <span>{spec}</span>
                            <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.specializations && <p className="text-xs text-destructive mt-2">{errors.specializations}</p>}
                </CardContent>
              </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Services Required</CardTitle>
                  <CardDescription>Select the translation services, specify quantities, units, and rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map((svc, idx) => {
                    const st = SERVICE_TYPES.find((s) => s.id === svc.serviceId);
                    return (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap items-end gap-3 bg-muted/30 p-3 rounded-lg">
                        <div className="flex-1 min-w-[150px] space-y-1">
                          <Label className="text-xs">Service</Label>
                          <Select value={svc.serviceId} onValueChange={(v) => updateService(idx, "serviceId", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {SERVICE_TYPES.map((s) => {
                                const taken = services.find((r, i) => i !== idx && r.serviceId === s.id);
                                return (
                                  <SelectItem key={s.id} value={s.id} disabled={!!taken}>
                                    {s.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input type="number" min="1" value={svc.quantity} onChange={(e) => updateService(idx, "quantity", Number(e.target.value))} />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Unit</Label>
                          <Select value={svc.unit} onValueChange={(v) => updateService(idx, "unit", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {SERVICE_UNITS.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Rate Type</Label>
                          <Select value={svc.isFixed ? "fixed" : "range"} onValueChange={(v) => updateService(idx, "isFixed", v === "fixed")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Rate</SelectItem>
                              <SelectItem value="range">Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {svc.isFixed ? (
                          <div className="w-28 space-y-1">
                            <Label className="text-xs">Unit Price (USD)</Label>
                            <Input type="number" step="0.001" min="0" value={svc.rate} onChange={(e) => updateService(idx, "rate", Number(e.target.value))} />
                          </div>
                        ) : (
                          <>
                            <div className="w-24 space-y-1">
                              <Label className="text-xs">Min Price</Label>
                              <Input type="number" step="0.001" min="0" value={svc.rateMin} onChange={(e) => updateService(idx, "rateMin", Number(e.target.value))} />
                            </div>
                            <div className="w-24 space-y-1">
                              <Label className="text-xs">Max Price</Label>
                              <Input type="number" step="0.001" min="0" value={svc.rateMax} onChange={(e) => updateService(idx, "rateMax", Number(e.target.value))} />
                            </div>
                          </>
                        )}
                        <div className="w-32 space-y-1">
                          <Label className="text-xs">Est. Total</Label>
                          <div className="h-10 flex items-center text-sm font-medium px-2 border rounded-md bg-background">
                            {svc.isFixed ? (
                              `$${(svc.quantity * svc.rate).toFixed(0)}`
                            ) : (
                              `$${(svc.quantity * svc.rateMin).toFixed(0)} - $${(svc.quantity * svc.rateMax).toFixed(0)}`
                            )}
                          </div>
                        </div>
                        {services.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="mb-0.5" onClick={() => removeService(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {availableServiceTypes.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={addService}>
                      <Plus className="h-4 w-4 mr-1" /> Add Service
                    </Button>
                  )}
                  <div className="flex justify-end pt-2 border-t">
                    <div className="text-lg font-bold">
                      Total Budget: {totalBudgetMin === totalBudgetMax ? (
                        `$${Math.round(totalBudgetMin).toLocaleString()}`
                      ) : (
                        `$${Math.round(totalBudgetMin).toLocaleString()} - $${Math.round(totalBudgetMax).toLocaleString()}`
                      )}
                    </div>
                  </div>
                  {errors.services && <p className="text-xs text-destructive">{errors.services}</p>}
                </CardContent>
              </Card>

              {visibility === "public" && (
              <Card>
                <CardHeader>
                  <CardTitle>Required CAT Tools</CardTitle>
                  <CardDescription>Select the translation tools the translator must be proficient in (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="catToolSelect">Add Required CAT Tool</Label>
                    <SearchableCatToolSelect
                      id="catToolSelect"
                      placeholder="Choose a CAT tool..."
                      selected={requiredCatTools}
                      onSelect={(val) => {
                        if (val && !requiredCatTools.includes(val)) {
                          setRequiredCatTools([...requiredCatTools, val]);
                        }
                      }}
                    />
                  </div>

                  {requiredCatTools.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Selected CAT Tools</Label>
                      <div className="flex flex-wrap gap-2">
                        {requiredCatTools.map((toolId) => {
                          const tool = CAT_TOOLS.find((t) => t.id === toolId);
                          return (
                            <Badge
                              key={toolId}
                              variant="default"
                              className="text-sm py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              onClick={() => toggleCatTool(toolId)}
                            >
                              <span>{tool?.name ?? toolId}</span>
                              <X className="h-3 w-3" />
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

              {visibility === "public" && (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-teal-600" />
                        Translation Test
                      </div>
                    </CardTitle>
                    <CardDescription>Upload a test file — all shortlisted translators will receive it automatically</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 mt-0">
                    <input 
                      type="checkbox" 
                      id="requiresTest" 
                      checked={requiresTest} 
                      onChange={(e) => setRequiresTest(e.target.checked)} 
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                    />
                    <Label htmlFor="requiresTest" className="font-medium cursor-pointer">Require Test</Label>
                  </div>
                </CardHeader>
                {requiresTest && (
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-border/40 rounded-xl bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-4">Translators will apply without a test. Once you shortlist them, the test file becomes available for them to download and submit their solution.</p>
                      
                      <div className="space-y-2">
                        <Label>Test Document / File</Label>
                        <input
                          ref={testFileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleTestUpload}
                        />
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={testUploading}
                            onClick={() => testFileInputRef.current?.click()}
                            className="gap-1.5"
                          >
                            {testUploading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5" />
                            )}
                            Upload Test File
                          </Button>
                          {testFileUrl ? (
                            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                              ✓ File uploaded successfully
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No file selected (PDF/Word)</span>
                          )}
                        </div>
                        {errors.testFile && <p className="text-xs text-destructive">{errors.testFile}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="testWordCount">Maximum Word Count (Max 250 words)</Label>
                          <Input
                            id="testWordCount"
                            type="number"
                            max="250"
                            min="1"
                            value={testWordCount}
                            onChange={(e) => setTestWordCount(e.target.value)}
                            placeholder="e.g. 150"
                          />
                          {errors.testWordCount && <p className="text-xs text-destructive">{errors.testWordCount}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="testDuration">Allowed Time (Hours)</Label>
                          <Input
                            id="testDuration"
                            type="number"
                            min="1"
                            value={testDuration}
                            onChange={(e) => setTestDuration(e.target.value)}
                            placeholder="e.g. 24"
                          />
                          {errors.testDuration && <p className="text-xs text-destructive">{errors.testDuration}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
              )}

              {visibility === "public" && (
              <Card>
                <CardHeader>
                  <CardTitle>Targeted Translator (Optional)</CardTitle>
                  <CardDescription>Route this job directly to a specific translator</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="externalTranslatorEmail">External Translator Email</Label>
                      <Input
                        id="externalTranslatorEmail"
                        type="email"
                        value={externalTranslatorEmail}
                        onChange={(e) => setExternalTranslatorEmail(e.target.value)}
                        placeholder="e.g. translator@example.com"
                      />
                      <p className="text-xs text-muted-foreground">We will email them an invite to this job.</p>
                      {errors.externalTranslatorEmail && <p className="text-xs text-destructive">{errors.externalTranslatorEmail}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previousTranslatorId">Previous Translator ID</Label>
                      <Input
                        id="previousTranslatorId"
                        type="text"
                        value={previousTranslatorId}
                        onChange={(e) => setPreviousTranslatorId(e.target.value)}
                        placeholder="e.g. TRAN_123456789"
                      />
                      <p className="text-xs text-muted-foreground">Enter the ID of a translator on the platform.</p>
                      {errors.previousTranslatorId && <p className="text-xs text-destructive">{errors.previousTranslatorId}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Job Limits</CardTitle>
                  <CardDescription>Set limits on applications for this job</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxApplicants">Maximum Applicants (Optional)</Label>
                    <Input
                      id="maxApplicants"
                      type="number"
                      min="1"
                      value={maxApplicants}
                      onChange={(e) => setMaxApplicants(e.target.value)}
                      placeholder="e.g. 10"
                    />
                    <p className="text-xs text-muted-foreground">When this limit is reached, the job will auto-close.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                      {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Calculated Project Budget</Label>
                      <div className="h-10 flex items-center text-sm font-semibold px-3 border rounded-md bg-muted/30">
                        {totalBudgetMin === totalBudgetMax ? (
                          `$${Math.round(totalBudgetMin).toLocaleString()} USD`
                        ) : (
                          `$${Math.round(totalBudgetMin).toLocaleString()} - $${Math.round(totalBudgetMax).toLocaleString()} USD`
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-4 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
