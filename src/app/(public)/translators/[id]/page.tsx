import * as React from 'react';
import { getProfile } from '@/app/actions/profiles';
import { getUserById } from '@/app/actions/users';
import { getFileDownloadUrl } from '@/app/actions/files';
import { RatingStars } from '@/components/profile/RatingStars';
import { ContactButton } from '@/components/profile/ContactButton';
import { createSessionClient } from '@/lib/server/appwrite';
import { 
  Languages, Award, FileDown, Globe, 
  ShieldCheck, Clock, MapPin 
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  const [profile, user] = await Promise.all([
    getProfile(id),
    getUserById(id),
  ]);

  if (!user || !profile) {
    notFound();
  }

  const cvUrl = profile.cvFileId ? await getFileDownloadUrl(profile.cvFileId) : null;

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-20">
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border)] p-8 shadow-xl text-center">
              <div className="relative inline-block mx-auto mb-6">
                <div className="h-32 w-32 rounded-3xl bg-[var(--accent)] flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.labels?.includes('verified') && (
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-emerald-900 rounded-full p-1 shadow-lg ring-4 ring-[var(--bg-secondary)]">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{user.name}</h1>
              <p className="text-[var(--text-secondary)] mt-1 font-medium italic">Professional Translator</p>
              
              <div className="mt-6 flex justify-center">
                <RatingStars rating={profile.rating} count={profile.totalJobs} size="lg" />
              </div>

              <div className="mt-8 space-y-4 pt-8 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-medium">
                  <Globe className="h-4 w-4 text-[var(--accent)]" />
                  <span>Native: {profile.nativeLanguage || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-medium">
                  <Clock className="h-4 w-4 text-[var(--accent)]" />
                  <span>{profile.totalJobs} Jobs Completed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-medium">
                  <MapPin className="h-4 w-4 text-[var(--accent)]" />
                  <span>Member since 2026</span>
                </div>
              </div>

              {cvUrl && (
                <a 
                  href={cvUrl}
                  download
                  className="mt-8 flex items-center justify-center gap-2 w-full rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] py-4 text-sm font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group"
                >
                  <FileDown className="h-4 w-4 text-[var(--accent)] group-hover:scale-110 transition-transform" />
                  Download CV
                </a>
              )}

              <ContactButton 
                translatorId={id} 
                translatorName={user.name} 
                currentUserId={(await createSessionClient().then(({ account }) => account.get()).catch(() => ({}))).$id || ''} 
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border)] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-[var(--accent)]" /> 
                Professional Biography
              </h2>
              <div className="prose dark:prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {profile.bio || `${user.name} hasn't provided a biography yet.`}
              </div>
            </div>

            {/* Language Pairs */}
            <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border)] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <Languages className="h-5 w-5 text-[var(--accent)]" /> 
                Language Experts
              </h2>
              
              <div className="flex flex-wrap gap-4">
                {profile.sourceLanguages?.map(s => (
                  profile.targetLanguages?.map(t => (
                    <div key={`${s}-${t}`} className="flex items-center gap-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] px-4 py-3 shadow-sm hover:border-[var(--accent)] transition-colors">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{s}</span>
                      <div className="h-0.5 w-4 bg-[var(--accent)]/40 rounded-full" />
                      <span className="text-sm font-bold text-[var(--text-primary)]">{t}</span>
                    </div>
                  ))
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border)] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {profile.specialties?.length ? (
                  profile.specialties.map(spec => (
                    <span key={spec} className="rounded-xl bg-[var(--bg-main)] border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                      {spec}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--text-secondary)] italic">No specialties listed.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
