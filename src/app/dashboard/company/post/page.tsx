"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Globe, Loader2, Plus, Send, TestTube, X, Upload } from "lucide-react";
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
}

export default function PostJobPage() {
  const router = useRouter();
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
  const [services, setServices] = React.useState<ServiceRow[]>([{ serviceId: "translation", quantity: 1000, unit: "word", rate: 0.08 }]);
  const [requiredCatTools, setRequiredCatTools] = React.useState<string[]>([]);
  const [requiresTest, setRequiresTest] = React.useState(false);
  const [testFileUrl, setTestFileUrl] = React.useState("");
  const [testDuration, setTestDuration] = React.useState("24");
  const [testWordCount, setTestWordCount] = React.useState("150");
  const [testUploading, setTestUploading] = React.useState(false);
  const testFileInputRef = React.useRef<HTMLInputElement>(null);
  const [reviewerType, setReviewerType] = React.useState<"company" | "translator">("company");
  const [selectedAiReviewer, setSelectedAiReviewer] = React.useState("gpt4o");
  const [budgetMin, setBudgetMin] = React.useState("50");
  const [budgetMax, setBudgetMax] = React.useState("300");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const availableServiceTypes = SERVICE_TYPES.filter(
    (s) => !services.find((r) => r.serviceId === s.id)
  );

  function addService() {
    if (availableServiceTypes.length === 0) return;
    const first = availableServiceTypes[0];
    setServices([...services, { serviceId: first.id, quantity: 1000, unit: first.unit, rate: first.unit === "word" ? 0.08 : 25.00 }]);
  }

  function removeService(idx: number) {
    setServices(services.filter((_, i) => i !== idx));
  }

  function updateService(idx: number, field: keyof ServiceRow, value: string | number) {
    setServices(services.map((s, i) => {
      if (i !== idx) return s;
      const next = { ...s, [field]: value };
      if (field === "serviceId") {
        const svc = SERVICE_TYPES.find((st) => st.id === value);
        next.unit = svc?.unit ?? "word";
        next.rate = next.unit === "word" ? 0.08 : 25.00;
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

  const totalBudget = React.useMemo(() => {
    const baseCost = services.reduce((sum, s) => sum + s.quantity * s.rate, 0);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (requiresTest) {
      if (!testFileUrl) {
        setErrors((prev) => ({ ...prev, testFile: "Test file is required when 'Require translation test' is active." }));
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

    if (!budgetMin || Number(budgetMin) <= 0) {
      setErrors((prev) => ({ ...prev, budgetMin: "Minimum budget must be positive." }));
      return;
    }
    if (!budgetMax || Number(budgetMax) <= 0) {
      setErrors((prev) => ({ ...prev, budgetMax: "Maximum budget must be positive." }));
      return;
    }
    if (Number(budgetMin) > Number(budgetMax)) {
      setErrors((prev) => ({ ...prev, budgetMin: "Minimum budget cannot exceed maximum budget." }));
      return;
    }

    const formData = {
      title,
      description,
      sourceLanguage: sourceLanguages.join(", "),
      targetLanguage: targetLanguages.join(", "),
      country: (workType === "onsite" || workType === "hybrid") ? country : undefined,
      workType,
      budget: Number(budgetMax),
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      deadline,
      specializations,
      services: services.map((s) => ({ serviceId: s.serviceId, quantity: s.quantity, unit: s.unit, rate: s.rate })),
      requiredCatTools: requiredCatTools.length > 0 ? requiredCatTools : undefined,
      requiresTest,
      testFileUrl: requiresTest ? testFileUrl : undefined,
      testDuration: requiresTest ? Number(testDuration) : undefined,
      testWordCount: requiresTest ? Number(testWordCount) : undefined,
      reviewerType,
    };

    const parsed = createJobSchema.safeParse(formData);

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
      await svc.job.createJob({
        ...parsed.data,
        services: JSON.stringify(parsed.data.services),
        budget: Number(budgetMax),
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        companyId: user?.$id || "",
      });
      toast({ title: "Job posted successfully!", variant: "success" });
      router.push("/dashboard/company");
    } catch (err: any) {
      console.error("Failed to post job error:", err);
      toast({ 
        title: "Failed to post job", 
        description: err?.message || "An unknown error occurred while posting the job", 
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
              <h1 className="text-2xl font-bold">Post a Job</h1>
              <p className="text-muted-foreground">Create a new translation project</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
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
                    <Select
                      onValueChange={(val) => {
                        if (val && !sourceLanguages.includes(val)) {
                          setSourceLanguages([...sourceLanguages, val]);
                        }
                      }}
                    >
                      <SelectTrigger id="sourceLanguageSelect">
                        <SelectValue placeholder="Add source language..." />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code} disabled={sourceLanguages.includes(lang.code)}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
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
                    <Select
                      onValueChange={(val) => {
                        if (val && !targetLanguages.includes(val)) {
                          setTargetLanguages([...targetLanguages, val]);
                        }
                      }}
                    >
                      <SelectTrigger id="targetLanguageSelect">
                        <SelectValue placeholder="Add target language..." />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code} disabled={targetLanguages.includes(lang.code)}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
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
                              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
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

              <Card>
                <CardHeader>
                  <CardTitle>Specializations</CardTitle>
                  <CardDescription>Select the expertise areas required for this project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specializationSelect">Add Specialization</Label>
                    <Select onValueChange={(val) => {
                      if (val && !specializations.includes(val)) {
                        setSpecializations([...specializations, val]);
                      }
                    }}>
                      <SelectTrigger id="specializationSelect">
                        <SelectValue placeholder="Choose a specialization..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.map((spec) => (
                          <SelectItem key={spec} value={spec} disabled={specializations.includes(spec)}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          <Label className="text-xs">Unit Price (USD)</Label>
                          <Input type="number" step="0.001" min="0.001" value={svc.rate} onChange={(e) => updateService(idx, "rate", Number(e.target.value))} />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Est. Total</Label>
                          <div className="h-10 flex items-center text-sm font-medium px-2 border rounded-md bg-background">${(svc.quantity * svc.rate).toFixed(0)}</div>
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
                    <div className="text-lg font-bold">Total Budget: ${Math.round(totalBudget).toLocaleString()}</div>
                  </div>
                  {errors.services && <p className="text-xs text-destructive">{errors.services}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required CAT Tools</CardTitle>
                  <CardDescription>Select the translation tools the translator must be proficient in (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="catToolSelect">Add Required CAT Tool</Label>
                    <Select onValueChange={(val) => {
                      if (val && !requiredCatTools.includes(val)) {
                        setRequiredCatTools([...requiredCatTools, val]);
                      }
                    }}>
                      <SelectTrigger id="catToolSelect">
                        <SelectValue placeholder="Choose a CAT tool..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CAT_TOOLS.map((tool) => (
                          <SelectItem key={tool.id} value={tool.id} disabled={requiredCatTools.includes(tool.id)}>
                            {tool.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <Card>
                <CardHeader>
                  <CardTitle>Review & Testing</CardTitle>
                  <CardDescription>Configure reviewer assignment and translator testing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reviewer</Label>
                    <div className="flex gap-6">
                      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <input type="radio" name="reviewerType" value="company" checked={reviewerType === "company"} onChange={() => setReviewerType("company")} className="mt-0.5 h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Company selects reviewer</p>
                          <p className="text-xs text-muted-foreground mt-1">We will assign a reviewer from our team to check the translation quality</p>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <input type="radio" name="reviewerType" value="translator" checked={reviewerType === "translator"} onChange={() => setReviewerType("translator")} className="mt-0.5 h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">We provides reviewer (AI Reviewer)</p>
                          <p className="text-xs text-muted-foreground mt-1">Select an advanced AI engine to review and check the translation quality. The client is responsible for paying the AI Reviewer cost.</p>
                        </div>
                      </label>
                    </div>
                    {reviewerType === "translator" && (
                      <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-3 mt-3">
                        <Label htmlFor="aiReviewerSelect">Select AI Reviewer Model</Label>
                        <Select value={selectedAiReviewer} onValueChange={setSelectedAiReviewer}>
                          <SelectTrigger id="aiReviewerSelect" className="bg-background">
                            <SelectValue placeholder="Choose AI reviewer..." />
                          </SelectTrigger>
                          <SelectContent>
                            {AI_REVIEWERS.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name} (${r.rate}/word)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {AI_REVIEWERS.find((r) => r.id === selectedAiReviewer)?.description}
                        </p>
                      </div>
                    )}
                    {errors.reviewerType && <p className="text-xs text-destructive">{errors.reviewerType}</p>}
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <input id="requiresTest" type="checkbox" checked={requiresTest} onChange={(e) => setRequiresTest(e.target.checked)} className="h-4 w-4 rounded border-input" />
                    <Label htmlFor="requiresTest" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                      <TestTube className="h-4 w-4 text-muted-foreground" />
                      Require a translation test from applicants
                    </Label>
                  </div>
                  {requiresTest && (
                    <div className="space-y-4 ml-7 p-4 border border-border/40 rounded-xl bg-muted/20">
                      <p className="text-xs text-muted-foreground">Applicants will be asked to complete a short test translation before their application is considered.</p>
                      
                      <div className="space-y-2">
                        <Label>Test Document / File (Required)</Label>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="budgetMin">Minimum Budget (USD)</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        min="1"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="e.g. 50"
                      />
                      {errors.budgetMin && <p className="text-xs text-destructive">{errors.budgetMin}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetMax">Maximum Budget (USD)</Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        min="1"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="e.g. 300"
                      />
                      {errors.budgetMax && <p className="text-xs text-destructive">{errors.budgetMax}</p>}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                      {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Est. Services Budget (Reference)</Label>
                      <div className="h-10 flex items-center text-sm font-semibold px-3 border rounded-md bg-muted/30">
                        ${Math.round(totalBudget).toLocaleString()} USD
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
                Post Job
              </Button>
            </div>
          </form>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
