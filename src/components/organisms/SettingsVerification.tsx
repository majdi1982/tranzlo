"use client"

import React, { useState } from "react"
import { ShieldCheck, FileCheck, Upload, CheckCircle2, AlertTriangle, Shield, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { updateProfile, uploadDocument } from "@/services/auth/actions"
import { submitKYC, getKYCStatus } from "@/services/kyc/actions"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

export function SettingsVerification({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [kycData, setKycData] = useState<any>(null)
  const [formData, setFormData] = useState({
    taxId: (user?.prefs as any)?.taxId || "",
    registrationNumber: (user?.prefs as any)?.registrationNumber || ""
  })

  React.useEffect(() => {
    async function fetchKYC() {
      const res = await getKYCStatus()
      if (res.success) setKycData(res.data)
    }
    fetchKYC()
  }, [])

  const handleFileUpload = async (type: string, file: File) => {
    setLoading(true)
    const res = await uploadDocument(file)
    if (res.success && res.fileId) {
       await submitKYC(type, res.fileId)
       const kycRes = await getKYCStatus()
       if (kycRes.success) setKycData(kycRes.data)
       toast.success("Verification document submitted for review!")
    }
    setLoading(false)
  }

  const handleSaveInfo = async () => {
    setLoading(true)
    await updateProfile({
      prefs: { 
        taxId: formData.taxId, 
        registrationNumber: formData.registrationNumber
      }
    })
    setLoading(false)
    toast.success("Verification info updated!")
  }

  const getStatusDisplay = () => {
    if (!kycData) return { label: "Unverified", icon: Shield, color: "text-muted-foreground", bg: "bg-white/5" }
    switch (kycData.status) {
      case "pending": return { label: "Pending Review", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" }
      case "verified": return { label: "Verified", icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/10" }
      case "rejected": return { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" }
      default: return { label: "Unverified", icon: Shield, color: "text-muted-foreground", bg: "bg-white/5" }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="space-y-8">
      <div className={cn("p-6 rounded-2xl border border-white/[0.05] flex items-center justify-between", status.bg)}>
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl bg-white/5", status.color)}>
            <status.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{status.label}</h3>
            <p className="text-sm text-muted-foreground">Account verification status</p>
          </div>
        </div>
        {kycData?.rejectionReason && (
          <p className="text-xs text-red-400 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">
            Reason: {kycData.rejectionReason}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard 
          title="ID Card / Passport" 
          description="Government issued identity document"
          isUploaded={kycData?.documentType === "id_card" || kycData?.documentType === "passport"} 
          onUpload={(f) => handleFileUpload("id_card", f)}
          loading={loading}
        />
        <UploadCard 
          title="Commercial Registry" 
          description="Business registration document"
          isUploaded={kycData?.documentType === "commercial_registry"} 
          onUpload={(f) => handleFileUpload("commercial_registry", f)}
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

function UploadCard({ title, description, isUploaded, onUpload, loading }: {
  title: string;
  description: string;
  isUploaded: boolean;
  onUpload: (file: File) => void;
  loading: boolean;
}) {
  return (
    <div className={cn("p-6 rounded-2xl border-2 border-dashed flex flex-col items-center text-center gap-4 transition-all", isUploaded ? "bg-green-500/5 border-green-500/20" : "bg-white/5 border-white/10 hover:border-primary/20 hover:bg-primary/[0.02]")}>
      <div className={isUploaded ? "text-green-500" : "text-muted-foreground"}>
        {isUploaded ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-6 h-6" />}
      </div>
      <div>
        <span className="font-bold text-sm block">{title}</span>
        <span className="text-[10px] text-muted-foreground">{description}</span>
      </div>
      <label className="w-full">
        <input type="file" className="hidden" disabled={loading} onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <Button variant={isUploaded ? "ghost" : "outline"} size="sm" className="w-full h-9 text-xs" disabled={loading}>
          {loading ? "Uploading..." : isUploaded ? "Update Document" : "Upload Document"}
        </Button>
      </label>
    </div>
  )
}
