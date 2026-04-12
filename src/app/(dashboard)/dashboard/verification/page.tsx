'use client';

import * as React from 'react';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { uploadVerificationDoc } from '@/app/actions/verification';

export default function VerificationPage() {
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'verified' | 'rejected'>('idle');
  const [isUploading, setIsUploading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await uploadVerificationDoc(formData);
    
    if (result.success) {
      setStatus('pending');
    } else {
      alert(result.error);
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-10 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-[var(--text-secondary)] hover:text-[var(--accent)] mb-8 uppercase tracking-widest transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Hub
      </Link>

      <div className="mb-10 text-center">
        <div className="h-20 w-20 rounded-3xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[var(--accent)]/5">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black text-[var(--text-primary)] font-outfit mb-2">Identity Verification</h1>
        <p className="text-[var(--text-secondary)] font-medium max-w-md mx-auto">
          Upload your "Role Papers" to build trust and unlock premium marketplace features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] text-center">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-xs font-black text-[var(--text-primary)] uppercase">Build Trust</p>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">Verified profiles get 3x more job matches.</p>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] text-center">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <p className="text-xs font-black text-[var(--text-primary)] uppercase">Fast Review</p>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">Our team reviews documents within 24-48 hours.</p>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] text-center">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-xs font-black text-[var(--text-primary)] uppercase">Secure</p>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-medium">Data is encrypted and visible only to admins.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-8 sm:p-12 shadow-sm">
        {status === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest block">Select Document Type</label>
              <select name="type" className="w-full px-6 py-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all appearance-none cursor-pointer">
                <option value="id_card">National ID / Passport</option>
                <option value="business_license">Business License (Companies)</option>
                <option value="certification">Translation Certificate / Diploma</option>
                <option value="tax_id">Tax ID / VAT Registration</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest block">Upload Role Paper</label>
              <div className="relative group">
                <input 
                  type="file" 
                  name="file"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="border-2 border-dashed border-[var(--border)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]/5 rounded-[2rem] p-12 text-center transition-all">
                  <Upload className="h-12 w-12 text-[var(--text-secondary)] group-hover:text-[var(--accent)] mx-auto mb-4 transition-colors" />
                  <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">PDF, PNG, or JPG (max. 10MB)</p>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isUploading}
              className="w-full py-5 rounded-[1.5rem] bg-[var(--text-primary)] text-white text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {isUploading ? 'Uploading documents...' : 'Submit Records for Review'}
            </button>
          </form>
        )}

        {status === 'pending' && (
          <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in duration-500">
             <div className="h-24 w-24 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-800 shadow-xl">
               <Clock className="h-10 w-10 animate-pulse" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">Verification Pending</h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium max-w-sm mx-auto">
                  Your "Role Paper" has been successfully uploaded. Our compliance team is now reviewing your documents.
                </p>
             </div>
             <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] inline-block">
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Expected completion: 48 Hours</p>
             </div>
             <div className="pt-6">
               <Link href="/dashboard" className="text-xs font-black text-[var(--accent)] hover:underline uppercase tracking-widest">Return to Hub</Link>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
