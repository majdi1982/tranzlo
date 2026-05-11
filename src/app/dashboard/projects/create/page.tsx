"use client"

import React, { useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion } from "framer-motion"
import { 
  Plus, 
  ArrowLeft, 
  Globe, 
  DollarSign, 
  Calendar, 
  FileText, 
  Layers, 
  Star, 
  Type,
  Upload
} from "lucide-react"
import { Button } from "@/components/atoms/Button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createProject } from "@/services/projects/actions"

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Translation",
    serviceType: "Document",
    experienceLevel: "Intermediate",
    sourceLanguage: "Arabic",
    targetLanguage: "English",
    budget: "",
    deadline: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await createProject({
      ...formData,
      budget: parseInt(formData.budget),
      status: "open"
    })

    if (result.success) {
      router.push("/dashboard/projects")
    } else {
      alert("Error: " + result.error)
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-outfit">Create New Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> General Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Technical Manual Translation"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your project requirements in detail..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Translation">Translation</option>
                    <option value="Interpretation">Interpretation</option>
                    <option value="Proofreading">Proofreading</option>
                    <option value="Localization">Localization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Service Type</label>
                  <select 
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Document">Document</option>
                    <option value="Website">Website</option>
                    <option value="Software">Software</option>
                    <option value="Legal">Legal</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Requirements */}
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Language & Expertise
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Source Language</label>
                <input
                  required
                  name="sourceLanguage"
                  value={formData.sourceLanguage}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target Language</label>
                <input
                  required
                  name="targetLanguage"
                  value={formData.targetLanguage}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Exp. Level</label>
                <select 
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Entry">Entry (Student/Junior)</option>
                  <option value="Intermediate">Intermediate (3+ years)</option>
                  <option value="Expert">Expert (10+ years)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Budget & Timeline */}
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> Budget & Timeline
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Budget ($)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Deadline</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 pb-12">
            <Button
              type="submit"
              size="lg"
              className="px-12 py-4 text-lg font-bold shadow-xl shadow-primary/30"
              disabled={loading}
            >
              {loading ? "Creating..." : "Post Project Now"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
