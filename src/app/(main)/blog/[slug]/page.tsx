import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Tag, User, ArrowLeft, Share2, Sparkles, Briefcase, Globe } from "lucide-react";
import { appwriteBlogService } from "@/services/appwrite.service";
import { mockBlogPosts } from "@/data/mock/blog";
import type { BlogPost } from "@/types";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_MAP: Record<string, string> = {
  "translation-tech": "تقنيات الترجمة والذكاء الاصطناعي",
  "linguistic-guides": "الأدلة اللغوية والإرشادية",
  "freelance-career": "العمل الحر والمسار المهني",
  "industry-trends": "اتجاهات صناعة الترجمة",
  "general": "عام",
};

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
  const ogImg = post.coverImage || "https://tranzlo.net/public/images/og-blog-fallback.jpg";

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
          alt: post.imageAlt || post.title,
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

  const categoryName = CATEGORY_MAP[post.category || "general"] || "عام";

  // JSON-LD Structured Schema Markup (Google Search console indexing optimization)
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage || "https://tranzlo.net/public/images/og-blog-fallback.jpg",
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "articleSection": categoryName,
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
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-4xl mx-auto z-10 space-y-8">
        {/* Navigation Return Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to chronicle
        </Link>

        {/* Article Container Card */}
        <article className="bg-card/40 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/5">
          
          {/* Article Cover Image Spot */}
          <div className="h-[300px] sm:h-[400px] bg-muted relative flex items-center justify-center border-b border-border">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.imageAlt || `Cover image for: ${post.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-primary/5 flex items-center justify-center p-6 text-center">
                <Share2 className="h-16 w-16 text-primary/20" />
              </div>
            )}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
              <span className="bg-background/90 text-primary border border-border px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                {categoryName}
              </span>
              {post.tags?.map((t) => (
                <span
                  key={t}
                  className="bg-background/90 text-muted-foreground border border-border px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border pb-6 justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary/70" />
                  Tranzlo Team
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary/70" />
                  5 min read
                </span>
              </div>

              {/* Dynamic Social Sharing buttons */}
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wide mr-1">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-background/60 border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 flex items-center justify-center"
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
                  className="p-2 bg-background/60 border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 flex items-center justify-center"
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
                  className="p-2 bg-background/60 border border-border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {post.title}
            </h1>

            {/* Structured Content Area for perfect crawlability */}
            <div className="prose prose-invert prose-cyan max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed space-y-6">
              {post.content.split("\n\n").map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4 border-l-2 border-primary pl-3">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-lg font-bold text-foreground mt-6 mb-3">
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                return (
                  <p key={index} className="whitespace-pre-line text-muted-foreground">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </article>

        {/* CTA Bottom Section linking back to Tranzlo Platform Services */}
        <div className="bg-gradient-to-r from-primary/5 via-card/60 to-primary/5 backdrop-blur-md border border-border p-8 rounded-3xl text-center space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Grow Your Global Business with Tranzlo
          </h3>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Whether you want to hire verified translators, post jobs, or register as a freelance linguist, Tranzlo provides automated localization pipelines.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="sm" className="px-6 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl">
                Get Started Free
              </Button>
            </Link>
            <Link href="/search?category=translators">
              <Button size="sm" variant="outline" className="px-6 py-2 text-xs font-bold border-border/80 hover:bg-muted text-muted-foreground rounded-xl">
                Search Translators
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
