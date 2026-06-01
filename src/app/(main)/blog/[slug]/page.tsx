import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Tag, User, ArrowLeft, Share2 } from "lucide-react";
import { appwriteBlogService } from "@/services/appwrite.service";
import { mockBlogPosts } from "@/data/mock/blog";
import type { BlogPost } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate rich dynamic metadata for Google crawlers and Social media card previews (OpenGraph/Twitter)
export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

  let post: BlogPost | null = null;
  try {
    post = await appwriteBlogService.getPost(slug);
  } catch (err) {
    console.error("Error fetching post for metadata:", err);
  }

  if (!post) {
    post = mockBlogPosts.find((p) => p.slug === slug) || null;
  }

  if (!post) return {};

  const shareUrl = `https://tranzlo.net/blog/${post.slug}`;
  const ogImg = post.coverImage || "https://tranzlo.net/public/images/og-blog-fallback.jpg"; // Fallback premium social image

  return {
    title: `${post.title} | Tranzlo Blog`,
    description: post.excerpt,
    alternates: {
      canonical: shareUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: shareUrl,
      type: "article",
      siteName: "Tranzlo",
      publishedTime: post.publishedAt || post.createdAt,
      authors: ["Tranzlo Team"],
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImg],
    },
  };
}

export default async function BlogPostDetailPage(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

  let post: BlogPost | null = null;
  try {
    post = await appwriteBlogService.getPost(slug);
  } catch (err) {
    console.error("Error fetching live post for SSR detail:", err);
  }

  if (!post) {
    post = mockBlogPosts.find((p) => p.slug === slug) || null;
  }

  if (!post || post.status !== "published") {
    notFound();
  }

  const shareUrl = `https://tranzlo.net/blog/${post.slug}`;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  // Generate dynamic JSON-LD Structured Data Schema markup for Google Rich Snippets
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage || "https://tranzlo.net/public/images/og-blog-fallback.jpg",
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "author": {
      "@type": "Organization",
      "name": "Tranzlo",
      "url": "https://tranzlo.net"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tranzlo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tranzlo.net/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      {/* Dynamic injection of the Google crawler schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Decorative top-hero visual spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-4xl mx-auto z-10 space-y-8">
        {/* Navigation Return Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to chronicle
        </Link>

        {/* Article Container Card */}
        <article className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/10">
          
          {/* Article Cover Image Spot */}
          <div className="h-[300px] sm:h-[400px] bg-slate-950 relative flex items-center justify-center border-b border-slate-800">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 flex items-center justify-center p-6 text-center">
                <Share2 className="h-16 w-16 text-cyan-500/20" />
              </div>
            )}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
              {post.tags?.map((t) => (
                <span
                  key={t}
                  className="bg-slate-950/90 text-cyan-400 border border-slate-800/80 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-800 pb-6 justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-cyan-500/70" />
                  Tranzlo Team
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-cyan-500/70" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan-500/70" />
                  5 min read
                </span>
              </div>

              {/* Dynamic Social Sharing card trigger buttons */}
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wide mr-1">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Share on X"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Share on Facebook"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.85z" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100 leading-tight">
              {post.title}
            </h1>

            {/* Structured Content Area for perfect crawlability */}
            <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-6">
              {post.content.split("\n\n").map((paragraph, index) => {
                // If it starts with a heading markdown, render as headings cleanly
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl sm:text-2xl font-bold text-slate-100 mt-8 mb-4 border-l-2 border-cyan-500 pl-3">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-lg font-bold text-slate-100 mt-6 mb-3">
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                return (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </article>

        {/* CTA Bottom Spotlight */}
        <div className="bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-cyan-950/30 backdrop-blur-md border border-slate-800/80 p-8 rounded-3xl text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Need Professional Localization Services?</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            Connect with our global network of translation experts to seamlessly deploy your business content internationally.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-xl transition-all duration-300"
            >
              Get Started Now
            </Link>
            <Link
              href="/jobs"
              className="px-5 py-2 text-xs font-bold bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all duration-300"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
