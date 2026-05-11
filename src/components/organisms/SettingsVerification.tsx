"use client"

import React, { useState } from "react"
import { ShieldCheck, FileCheck, Upload, CheckCircle2, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { updateProfile, uploadDocument } from "@/services/auth/actions"
import { cn } from "@/lib/utils"

export function SettingsVerification({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    taxId: (user?.prefs as any)?.taxId || "",
    registrationNumber: (user?.prefs as any)?.registrationNumber || ""
  })

  const handleFileUpload = async (key: string, file: File) => {
    setLoading(true)
    const res = await uploadDocument(file)
    if (res.success) {
       await updateProfile({ prefs: { [`doc_${key}`]: res.fileId } })
       alert("Document uploaded successfully!")
    }
    setLoading(false)
  }

  const handleSaveInfo = async () => {
    setLoading(true)
    await updateProfile({
      prefs: { 
        taxId: formData.taxId, 
        registrationNumber: formData.registrationNumber,
        verificationStatus: (user?.prefs as any)?.verificationStatus || "pending"
      }
    })
    setLoading(false)
    alert("Verification info submitted!")
  }

  const verificationStatus = (user?.prefs as any)?.verificationStatus || "unverified"

  return (
    <div className="space-y-8">
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-sm text-amber-200">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <p>Verification is required for business accounts. Please provide valid government-issued documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard 
          title="Commercial Registration" 
          isUploaded={!!(user?.prefs as any)?.doc_cr} 
          onUpload={(f) => handleFileUpload("cr", f)}
          loading={loading}
        />
        <UploadCard 
          title="Tax Certificate" 
          isUploaded={!!(user?.prefs as any)?.doc_tax} 
          onUpload={(f) => handleFileUpload("tax", f)}
          loading={loading}
        />
      </div>

      <div className="space-y-4 pt-6 border-t border-white/5">
        <h3 className="font-bold text-lg">Identity Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            placeholder="Tax ID Number"
            value={formData.taxId}
            onChange={(e) => setFormData({...formData, taxId: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          />
          <input 
            placeholder="Registration No."
            value={formData.registrationNumber}
            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          />
        </div>
        <Button onClick={handleSaveInfo} disabled={loading} className="w-full">Submit for Review</Button>
      </div>
    </div>
  )
}

function UploadCard({ title, isUploaded, onUpload, loading }: any) {
  return (
    <div className={cn("p-6 rounded-2xl border-2 border-dashed flex flex-col items-center text-center gap-4", isUploaded ? "bg-green-500/5 border-green-500/20" : "bg-white/5 border-white/10")}>
      <div className={isUploaded ? "text-green-500" : "text-muted-foreground"}>
        {isUploaded ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
      </div>
      <span className="font-bold text-sm">{title}</span>
      <label className="w-full">
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <Button variant="outline" size="sm" className="w-full h-9 text-xs" asChild>
          <span>{isUploaded ? "Replace" : "Upload"}</span>
        </Button>
      </label>
    </div>
  )
}
