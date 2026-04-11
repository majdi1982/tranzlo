import * as React from 'react';
import { getBlogPosts } from '@/app/actions/blog';
import Link from 'next/link';
import { 
  Calendar, User, ArrowRight, BookOpen, 
  Tag, Search, Sparkles 
} from 'lucide-react';

export default async function BlogListingPage() {
  const posts = await getBlogPosts();

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative py-24 bg-[var(--bg-secondary)] border-b border-[var(--border)] overflow-hidden">
        <div className="absolute top-0 right-0 -tranzlate-y-1/2 tranzlate-x-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-bold text-[var(--accent)] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Insights & Guides
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] font-outfit mb-6 tracking-tight">
            Tranzlo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Journal</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[var(--text-secondary)] font-medium">
            Explore the latest trends in global translation, professional tips for translators, and growth strategies for ambitious companies.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <article 
                    key={post.$id}
                    className="group bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-2xl hover:border-[var(--accent)] hover:-translate-y-1"
                  >
                    <div className="aspect-[16/9] bg-[var(--bg-main)] relative overflow-hidden">
                      {post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                          <BookOpen className="h-12 w-12 text-[var(--accent)]/20" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-[var(--accent)] shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(post.$createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {post.author}
                        </div>
                      </div>

                      <h2 className="text-xl font-black text-[var(--text-primary)] mb-4 line-clamp-2 underline-offset-4 decoration-[var(--accent)] decoration-2 group-hover:underline">
                        {post.title}
                      </h2>
                      
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-8">
                        {post.excerpt || 'No excerpt available for this post.'}
                      </p>

                      <Link 
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-black text-[var(--accent)] uppercase tracking-widest group-hover:gap-3 transition-all"
                      >
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center bg-[var(--bg-secondary)] border border-dashed border-[var(--border)] rounded-3xl">
                 <Search className="h-12 w-12 text-[var(--text-secondary)]/20 mx-auto mb-6" />
                 <h3 className="text-xl font-bold text-[var(--text-primary)]">No articles found</h3>
                 <p className="text-[var(--text-secondary)] mt-2">Check back soon for new insights and updates.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-10">
            {/* Search */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-4">Search Journal</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Keywords..." 
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-xs focus:border-[var(--accent)] focus:outline-none"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-4">Categories</h3>
              <div className="space-y-2">
                {['Marketplace', 'Technology', 'Freelancing', 'Case Studies'].map(cat => (
                  <button key={cat} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group">
                    <span className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      {cat}
                    </span>
                    <span className="bg-[var(--bg-main)] px-2 py-0.5 rounded-md text-[9px] group-hover:bg-[var(--accent)]/10">12</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
