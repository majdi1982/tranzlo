import * as React from 'react';
import { getBlogPostBySlug } from '@/app/actions/blog';
import { 
  Calendar, User, ArrowLeft, Share2, 
  Clock, Tag, Globe, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="bg-[var(--bg-main)] min-h-screen pb-24 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-1/2 -tranzlate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[var(--accent)]/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative pt-12">
        {/* Navigation */}
        <div className="mb-12">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Journal
          </Link>
        </div>

        {/* Article Meta */}
        <div className="space-y-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] shadow-sm">
            <Tag className="h-3 w-3" />
            {post.category}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] font-outfit tracking-tighter leading-[1.1]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                {post.author.charAt(0)}
              </div>
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--accent)]" />
              {new Date(post.$createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--accent)]" />
              8 min read
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-16 rounded-[40px] overflow-hidden border border-[var(--border)] shadow-2xl shadow-black/10">
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="w-full h-auto object-cover max-h-[600px]"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="bg-[var(--bg-secondary)] rounded-[40px] border border-[var(--border)] p-8 sm:p-12 lg:p-16 shadow-sm relative">
          <div className="prose dark:prose-invert max-w-none text-[var(--text-primary)] 
            prose-headings:font-black prose-headings:font-outfit prose-headings:tracking-tight
            prose-p:text-lg prose-p:leading-relaxed prose-p:text-[var(--text-secondary)] 
            prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-3xl prose-blockquote:border-[var(--accent)] prose-blockquote:bg-[var(--bg-main)] prose-blockquote:rounded-2xl prose-blockquote:p-6 prose-blockquote:not-italic
          ">
            {/* Using a simple multi-line display for the content. For complex HTML, convert Markdown to HTML components */}
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Social Share Footer */}
          <div className="mt-16 pt-12 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Share Journal:</span>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <button key={i} className="h-10 w-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white hover:border-transparent transition-all">
                    <Share2 className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] italic">
               <Sparkles className="h-4 w-4 text-yellow-500" />
               Join the conversation on Tranzlo
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-12 text-center text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-3xl font-black mb-4 relative z-10">Start your journey with Tranzlo</h3>
          <p className="text-white/80 max-w-md mx-auto mb-10 relative z-10 text-lg font-medium">
             Connect with 2,500+ professionals and build global language solutions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-white text-blue-700 font-black text-sm rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              Get Started for Free
            </Link>
            <Link 
              href="/jobs" 
              className="px-8 py-4 bg-black/20 backdrop-blur-md text-white border border-white/20 font-black text-sm rounded-2xl hover:bg-black/30 transition-all"
            >
              Browse Global Jobs
            </Link>
          </div>
        </div>

      </div>
    </article>
  );
}
