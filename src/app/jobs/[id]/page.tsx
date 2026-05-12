"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getJobById, applyToJob } from "@/services/jobs/actions"
import { Job } from "@/types"
import { Button } from "@/components/atoms/Button"
import { Input } from "@/components/atoms/Input"
import { useForm } from "react-hook-form"

export default function JobDetailsPage() {
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    async function loadJob() {
      const result = await getJobById(id as string)
      if (result.success) setJob(result.data || null)
      setLoading(false)
    }
    loadJob()
  }, [id])

  const onApply = async (data: any) => {
    const result = await applyToJob(id as string, {
      proposalText: data.proposalText,
      price: data.price,
      deliveryTime: data.deliveryTime,
    })
    if (result.success) {
      alert("Application submitted!")
      reset()
    } else {
      alert("Error: " + result.error)
    }
  }

  if (loading) return <div className="p-10 text-center">Loading job details...</div>
  if (!job) return <div className="p-10 text-center">Job not found.</div>

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-4xl font-bold">{job.title}</h1>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
        
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05] grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Language Pair</p>
            <p className="font-bold">{job.sourceLanguage} → {job.targetLanguage}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Budget</p>
            <p className="font-bold">${job.budget}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 h-fit space-y-6">
        <h3 className="text-xl font-bold">Apply for this job</h3>
        <form onSubmit={handleSubmit(onApply)} className="space-y-4">
          <Input 
            label="Your Proposal Price ($)" 
            type="number" 
            {...register("price", { valueAsNumber: true })} 
            required 
          />
          <Input 
            label="Estimated Delivery" 
            placeholder="e.g. 3 days" 
            {...register("deliveryTime")} 
            required 
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Proposal Message</label>
            <textarea 
              {...register("proposalText")}
              className="input-field w-full min-h-[100px] resize-none"
              required
            />
          </div>
          <Button type="submit" className="w-full">Submit Application</Button>
        </form>
      </div>
    </div>
  )
}
