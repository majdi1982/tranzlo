import React from "react"
import { Globe } from "lucide-react"

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <div className={`${className} rounded-lg bg-premium-gradient flex items-center justify-center shadow-lg shadow-primary/20`}>
      <Globe className="w-5 h-5 text-white" />
    </div>
  )
}
