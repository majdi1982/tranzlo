"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Globe, Loader2, Plus, Send, TestTube, X } from "lucide-react";
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
import { SERVICE_TYPES } from "@/data/service-types";
import { CAT_TOOLS } from "@/data/cat-tools";
import { createJobSchema } from "@/validators";

interface ServiceRow {
  serviceId: string;
  quantity: number;
  unit: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sourceLanguage, setSourceLanguage] = React.useState("");
  const [targetLanguage, setTargetLanguage] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [workType, setWorkType] = React.useState<"onsite" | "online">("online");
  const [deadline, setDeadline] = React.useState("");
  const [specializations, setSpecializations] = React.useState<string[]>([]);
  const [services, setServices] = React.useState<ServiceRow[]>([{ serviceId: "translation", quantity: 1000, unit: "word" }]);
  const [requiredCatTools, setRequiredCatTools] = React.useState<string[]>([]);
  const [requiresTest, setRequiresTest] = React.useState(false);
  const [reviewerType, setReviewerType] = React.useState<"company" | "translator">("company");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const availableServiceTypes = SERVICE_TYPES.filter(
    (s) => !services.find((r) => r.serviceId === s.id)
  );

  function addService() {
    if (availableServiceTypes.length === 0) return;
    const first = availableServiceTypes[0];
    setServices([...services, { serviceId: first.id, quantity: 1000, unit: first.unit }]);
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

  const totalBudget = React.useMemo(() => {
    return services.reduce((sum, s) => sum + s.quantity * 0.08, 0);
  }, [services]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData = {
      title,
      description,
      sourceLanguage,
      targetLanguage,
      country: workType === "onsite" ? country : undefined,
      workType,
      budget: Math.round(totalBudget),
      deadline,
      specializations,
      services: services.map((s) => ({ serviceId: s.serviceId, quantity: s.quantity, unit: s.unit })),
      requiredCatTools: requiredCatTools.length > 0 ? requiredCatTools : undefined,
      requiresTest,
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

    if (workType === "onsite" && !country) {
      setErrors((prev) => ({ ...prev, country: "Country is required for on-site jobs" }));
      return;
    }

    setSaving(true);
    try {
      const svc = getServices();
      await svc.job.createJob({
        ...parsed.data,
        services: JSON.stringify(parsed.data.services),
        budget: Math.round(totalBudget),
        companyId: user?.$id || "",
      });
      toast({ title: "Job posted successfully!", variant: "success" });
      router.push("/dashboard/company");
    } catch {
      toast({ title: "Failed to post job", variant: "destructive" });
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
                    <Label htmlFor="sourceLanguage">Source Language</Label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger id="sourceLanguage"><SelectValue placeholder="Select language" /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name} ({lang.nativeName})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sourceLanguage && <p className="text-xs text-destructive">{errors.sourceLanguage}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetLanguage">Target Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger id="targetLanguage"><SelectValue placeholder="Select language" /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name} ({lang.nativeName})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.targetLanguage && <p className="text-xs text-destructive">{errors.targetLanguage}</p>}
                  </div>

                  <div className="space-y-3 sm:col-span-2">
                    <Label>Work Type</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="workType" value="online" checked={workType === "online"} onChange={() => setWorkType("online")} className="h-4 w-4" />
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Online (Remote)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="workType" value="onsite" checked={workType === "onsite"} onChange={() => setWorkType("onsite")} className="h-4 w-4" />
                        <span className="text-sm">On-site (In Person)</span>
                      </label>
                    </div>
                  </div>

                  {workType === "onsite" && (
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country"><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                    </div>
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
                  <CardDescription>Select the translation services and specify quantities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map((svc, idx) => {
                    const st = SERVICE_TYPES.find((s) => s.id === svc.serviceId);
                    return (
                      <div key={idx} className="flex items-end gap-3 bg-muted/30 p-3 rounded-lg">
                        <div className="flex-1 space-y-1">
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
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Quantity ({svc.unit})</Label>
                          <Input type="number" min="1" value={svc.quantity} onChange={(e) => updateService(idx, "quantity", Number(e.target.value))} />
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-xs">Unit</Label>
                          <div className="h-10 flex items-center text-sm text-muted-foreground px-2 border rounded-md bg-background">{svc.unit}</div>
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Est. Total</Label>
                          <div className="h-10 flex items-center text-sm font-medium px-2 border rounded-md bg-background">${(svc.quantity * 0.08).toFixed(0)}</div>
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
                          <p className="text-sm font-medium">Translator provides reviewer</p>
                          <p className="text-xs text-muted-foreground mt-1">The translator will arrange their own reviewer. We only pay for the translation.</p>
                        </div>
                      </label>
                    </div>
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
                    <p className="text-xs text-muted-foreground ml-7">Applicants will be asked to complete a short test translation before their application is considered.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget & Timeline</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Total Budget (USD)</Label>
                    <div className="h-10 flex items-center text-lg font-bold px-3 border rounded-md bg-muted/50">${Math.round(totalBudget).toLocaleString()}</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
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
