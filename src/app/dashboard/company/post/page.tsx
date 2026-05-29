"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LANGUAGES } from "@/data/languages";
import { SPECIALIZATIONS } from "@/data/specializations";
import { COUNTRIES } from "@/data/countries";
import { createJobSchema } from "@/validators";

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    sourceLanguage: "",
    targetLanguage: "",
    country: "",
    remote: true,
    budget: "",
    deadline: "",
    specialization: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = createJobSchema.safeParse({
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const services = getServices();
      await services.job.createJob({
        ...parsed.data,
        budget: Number(form.budget),
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
        <div className="max-w-2xl mx-auto space-y-6">
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
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="e.g. Website Localization - English to Arabic"
                    />
                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="Describe the project scope, requirements, and any specific instructions..."
                      className="min-h-[140px]"
                    />
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
                    <Select value={form.sourceLanguage} onValueChange={(v) => update("sourceLanguage", v)}>
                      <SelectTrigger id="sourceLanguage">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name} ({lang.nativeName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sourceLanguage && <p className="text-xs text-destructive">{errors.sourceLanguage}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetLanguage">Target Language</Label>
                    <Select value={form.targetLanguage} onValueChange={(v) => update("targetLanguage", v)}>
                      <SelectTrigger id="targetLanguage">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name} ({lang.nativeName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.targetLanguage && <p className="text-xs text-destructive">{errors.targetLanguage}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={form.country} onValueChange={(v) => update("country", v)}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select value={form.specialization} onValueChange={(v) => update("specialization", v)}>
                      <SelectTrigger id="specialization">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specialization && <p className="text-xs text-destructive">{errors.specialization}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget & Timeline</CardTitle>
                  <CardDescription>Set the budget and deadline</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="1"
                      value={form.budget}
                      onChange={(e) => update("budget", e.target.value)}
                      placeholder="500"
                    />
                    {errors.budget && <p className="text-xs text-destructive">{errors.budget}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => update("deadline", e.target.value)}
                    />
                    {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                      id="remote"
                      type="checkbox"
                      checked={form.remote}
                      onChange={(e) => update("remote", e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="remote" className="text-sm font-normal">This job can be done remotely</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Post Job
              </Button>
            </div>
          </form>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
