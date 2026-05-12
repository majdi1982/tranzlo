"use client"

import React, { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { motion, AnimatePresence } from "framer-motion"
import { submitReview } from "@/services/reviews/actions"
import { updateJobStatus } from "@/services/jobs/actions"
import { toast } from "react-hot-toast"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  revieweeId: string
}

export const ReviewModal = ({ isOpen, onClose, jobId, revieweeId }: ReviewModalProps) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await submitReview(jobId, revieweeId, rating, comment)
      await updateJobStatus(jobId, "completed")
      toast.success("Project completed and review submitted!")
      onClose()
      window.location.reload()
    } catch (error) {
      toast.error("Error submitting review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card p-8 flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold font-outfit mb-2">Complete Project</h2>
              <p className="text-sm text-muted-foreground">Please rate your experience with the translator to complete the project.</p>
            </div>

            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-transform active:scale-95 ${star <= rating ? "text-yellow-400" : "text-white/10"}`}
                >
                  <Star className={`w-8 h-8 ${star <= rating ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full min-h-[100px] bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Complete & Review"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
