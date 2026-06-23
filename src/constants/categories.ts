export const BLOG_CATEGORIES = {
  "translation-tech": "AI & Translation Tech",
  "career-growth": "Linguist & Career Growth",
  "industry-trends": "Industry Insights & Trends",
  "best-practices": "Best Practices & Guides",
  "platform-news": "Platform News & Updates",
  "general": "General",
} as const;

export type BlogCategorySlug = keyof typeof BLOG_CATEGORIES;
export type BlogCategoryName = (typeof BLOG_CATEGORIES)[BlogCategorySlug];

export const BLOG_CATEGORY_SLUGS = Object.keys(BLOG_CATEGORIES) as BlogCategorySlug[];
export const BLOG_CATEGORY_NAMES = Object.values(BLOG_CATEGORIES);

export const BLOG_CATEGORY_MAP: Record<string, string> = {
  ...BLOG_CATEGORIES,
  // Aliases for backward compatibility with RSS/AI generation
  "academic": "translation-tech",
  "medical": "general",
  "legal": "general",
  "technical": "translation-tech",
  "tech": "translation-tech",
  "business": "industry-trends",
  "finance": "industry-trends",
  "seo": "best-practices",
  "marketing": "best-practices",
  "lifestyle": "general",
  "translation": "general",
  "technology": "translation-tech",
};
