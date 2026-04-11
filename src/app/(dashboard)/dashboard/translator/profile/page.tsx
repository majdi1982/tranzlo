'use client';

import * as React from 'react';
import { updateProfile, getProfile, type Profile } from '@/app/actions/profiles';
import FileUploader, { type UploadedFile } from '@/components/file-uploader';
import { 
  User, Languages, Award, FileText, 
  Save, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function ProfileEditor() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [profile, setProfile] = React.useState<Partial<Profile>>({
    bio: '',
    nativeLanguage: '',
    sourceLanguages: [],
    targetLanguages: [],
    specialties: [],
  });

  // Load initial profile data
  React.useEffect(() => {
    async function loadData() {
      // We need user ID, but action gets it from session
      const res = await fetch('/api/auth/me').then(r => r.json());
      if (res.user) {
        const p = await getProfile(res.user.$id);
        if (p) setProfile(p);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await updateProfile(profile as any);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || 'Failed to save profile');
    }
    setSaving(false);
  };

  const updateArrayField = (field: keyof Profile, value: string) => {
    const current = (profile[field] as string[]) || [];
    if (current.includes(value)) {
      setProfile({ ...profile, [field]: current.filter(v => v !== value) });
    } else {
      setProfile({ ...profile, [field]: [...current, value] });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">My Professional Profile</h1>
        <p className="text-[var(--text-secondary)] mt-2">Build your reputation. Complete profiles are 5x more likely to win jobs.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Bio Section */}
        <section className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">About Me</h2>
          </div>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={6}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
            placeholder="Tell companies about your experience, background, and why they should hire you..."
          />
        </section>

        {/* Languages Section */}
        <section className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Languages className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Languages</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Native Language</label>
              <input
                type="text"
                value={profile.nativeLanguage}
                onChange={(e) => setProfile({ ...profile, nativeLanguage: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="e.g. Arabic"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Source Languages (From)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.sourceLanguages?.map((lang: string) => (
                    <span key={lang} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {lang}
                      <button type="button" onClick={() => updateArrayField('sourceLanguages', lang)}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      updateArrayField('sourceLanguages', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)]"
                  placeholder="Type and press Enter..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Target Languages (To)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.targetLanguages?.map((lang: string) => (
                    <span key={lang} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {lang}
                      <button type="button" onClick={() => updateArrayField('targetLanguages', lang)}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      updateArrayField('targetLanguages', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)]"
                  placeholder="Type and press Enter..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Specialties</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.specialties?.map((spec: string) => (
              <span key={spec} className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {spec}
                <button type="button" onClick={() => updateArrayField('specialties', spec)}>×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                updateArrayField('specialties', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-sm focus:border-[var(--accent)]"
            placeholder="e.g. Legal, Medical, Technical Writing..."
          />
        </section>

        {/* CV Section */}
        <section className="bg-[var(--bg-secondary)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Curriculum Vitae (CV)</h2>
          </div>
          <FileUploader
            label="Upload your professional CV (PDF/Word)"
            maxFiles={1}
            onFilesChange={(files) => {
              if (files.length > 0) setProfile({ ...profile, cvFileId: files[0].fileId });
            }}
          />
        </section>

        {/* Status / Save */}
        <div className="sticky bottom-6 flex items-center justify-between gap-4 bg-[var(--bg-secondary)]/80 backdrop-blur-md p-4 rounded-2xl border border-[var(--border)] shadow-xl z-20">
          <div className="flex-1">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="h-4 w-4" />
                Changes saved successfully!
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 hover:bg-[var(--hover)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
