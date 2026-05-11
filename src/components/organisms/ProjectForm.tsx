"use client"

import React from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormField } from "@/components/molecules/FormField"
import { Button } from "@/components/atoms/Button"
import { createJob } from "@/services/jobs/actions"

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  sourceLanguage: z.string().min(2, "Required"),
  targetLanguage: z.string().min(2, "Required"),
  budget: z.number().min(5, "Minimum budget is $5"),
})

type ProjectFormValues = {
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  budget: number;
}

export const ProjectForm = () => {
  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      sourceLanguage: "English",
      targetLanguage: "",
      budget: 0,
    },
  })

  const onSubmit = async (data: ProjectFormValues) => {
    const result = await createJob({
      ...data,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
    });

    if (result.success) {
      alert("Job posted successfully!");
      methods.reset();
    } else {
      alert("Error: " + result.error);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <FormField name="title" label="Project Title" placeholder="e.g. Website Localization for Tech SaaS" />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField name="sourceLanguage" label="Source Language" placeholder="English" />
          <FormField name="targetLanguage" label="Target Language" placeholder="Arabic" />
        </div>

        <div className="w-full space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">Description</label>
          <textarea 
            {...methods.register("description")}
            className="input-field w-full min-h-[120px] resize-none"
            placeholder="Describe your project requirements..."
          />
          {methods.formState.errors.description && (
            <p className="text-xs text-red-500 mt-1 ml-1">{methods.formState.errors.description.message}</p>
          )}
        </div>

        <FormField 
          name="budget" 
          label="Estimated Budget ($)" 
          type="number" 
          placeholder="50.00" 
          registerOptions={{ valueAsNumber: true }}
        />

        <Button type="submit" className="w-full" isLoading={methods.formState.isSubmitting}>
          Post Project
        </Button>
      </form>
    </FormProvider>
  )
}
