'use client';

import * as React from 'react';
import { createJob } from '@/app/actions/jobs';
import FileUploader, { type UploadedFile } from '@/components/file-uploader';
import { Paperclip } from 'lucide-react';

export default function NewJobPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [attachments, setAttachments] = React.useState<UploadedFile[]>([]);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    // Inject attachment IDs into form
    attachments.forEach(f => formData.append('attachmentIds[]', f.fileId));
    const result = await createJob(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsPending(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Post a New Job</h1>
      <p className="text-[var(--text-secondary)] mb-8">Fill in the details below. You can attach reference files like glossaries, Excel sheets, or documents.</p>
      
      <form action={handleSubmit} className="space-y-6 bg-[var(--bg-secondary)] p-8 rounded-2xl shadow-sm border border-[var(--border)]">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[var(--text-primary)]">Job Title</label>
          <input 
            type="text" id="title" name="title" required
            className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" 
            placeholder="e.g. Legal Document Translation" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sourceLang" className="block text-sm font-medium text-[var(--text-primary)]">Source Language</label>
            <input 
              type="text" id="sourceLang" name="sourceLang" required
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" 
              placeholder="e.g. English" 
            />
          </div>
          <div>
            <label htmlFor="targetLang" className="block text-sm font-medium text-[var(--text-primary)]">Target Language</label>
            <input 
              type="text" id="targetLang" name="targetLang" required
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" 
              placeholder="e.g. Spanish" 
            />
          </div>
        </div>

        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-[var(--text-primary)]">Service Type</label>
          <select id="serviceType" name="serviceType"
            className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]">
            <option value="translation">Translation</option>
            <option value="proofreading">Proofreading</option>
            <option value="transcription">Transcription</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--text-primary)]">Job Description</label>
          <textarea 
            id="description" name="description" required rows={5}
            className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none" 
            placeholder="Describe the job, requirements, document length etc..." 
          />
        </div>

        {/* ─── File Attachments ──────────────── */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-3">
            <Paperclip className="h-4 w-4 text-[var(--accent)]" />
            Reference Files <span className="text-[var(--text-secondary)] font-normal">(optional)</span>
          </label>
          <FileUploader
            label="Attach Excel, Word, PDF, or ZIP files"
            maxFiles={5}
            onFilesChange={setAttachments}
          />
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover)] transition-all disabled:opacity-70"
        >
          {isPending ? 'Publishing...' : 'Publish Job'}
        </button>
      </form>
    </div>
  );
}

