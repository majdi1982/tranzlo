'use client';

import * as React from 'react';
import { uploadJobAttachment } from '@/app/actions/files';
import {
  FileSpreadsheet, FileText, File, Trash2,
  UploadCloud, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

export interface UploadedFile {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface FileUploaderProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  label?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  if (['doc', 'docx', 'txt'].includes(ext || '')) return <FileText className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-[var(--text-secondary)]" />;
}

export default function FileUploader({
  onFilesChange,
  maxFiles = 5,
  label = 'Attach reference files',
}: FileUploaderProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    if (files.length >= maxFiles) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setError(null);
    setUploading(true);

    const remainingSlots = maxFiles - files.length;
    const toUpload = Array.from(incoming).slice(0, remainingSlots);

    const results: UploadedFile[] = [];

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadJobAttachment(fd);
      if ('error' in result) {
        setError(result.error);
        break;
      } else {
        results.push(result);
      }
    }

    const updated = [...files, ...results];
    setFiles(updated);
    onFilesChange?.(updated);
    setUploading(false);
  };

  const removeFile = (fileId: string) => {
    const updated = files.filter(f => f.fileId !== fileId);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file IDs for form submission */}
      {files.map(f => (
        <input key={f.fileId} type="hidden" name="attachmentIds[]" value={f.fileId} />
      ))}

      {/* Drop Zone */}
      {files.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all
            ${dragOver
              ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]'
              : 'border-[var(--border)] bg-[var(--bg-main)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5'
            }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          ) : (
            <UploadCloud className={`h-8 w-8 transition-colors ${dragOver ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
          )}
          <div className="text-sm text-center">
            <p className="font-semibold text-[var(--text-primary)]">
              {uploading ? 'Uploading...' : label}
            </p>
            <p className="text-[var(--text-secondary)] mt-0.5">
              {dragOver ? 'Release to upload' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Excel, Word, PDF, CSV, ZIP · max 20MB · up to {maxFiles} files
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt,.zip"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.fileId}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3"
            >
              <FileIcon name={file.fileName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{file.fileName}</p>
                <p className="text-xs text-[var(--text-secondary)]">{formatBytes(file.fileSize)}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <button
                type="button"
                onClick={() => removeFile(file.fileId)}
                className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
