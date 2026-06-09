import { MetadataRoute } from "next";
import { Client, Databases, Query } from "node-appwrite";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tranzlo.net";

const staticPages: { path: string; priority: number; changefreq: string }[] = [
  { path: "", priority: 1.0, changefreq: "weekly" },
  { path: "/blog", priority: 0.8, changefreq: "daily" },
  { path: "/jobs", priority: 0.8, changefreq: "daily" },
  { path: "/search", priority: 0.6, changefreq: "weekly" },
  { path: "/translators", priority: 0.7, changefreq: "weekly" },
  { path: "/companies", priority: 0.6, changefreq: "weekly" },
  { path: "/pricing", priority: 0.7, changefreq: "monthly" },
  { path: "/support", priority: 0.4, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/refund", priority: 0.3, changefreq: "yearly" },
  { path: "/cookies", priority: 0.3, changefreq: "yearly" },
];

async function fetchDynamicUrls(): Promise<MetadataRoute.Sitemap> {
  const apiKey = process.env.APPWRITE_API_KEY;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";

  if (!apiKey) return [];

  try {
    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
    const db = new Databases(client);
    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";
    const urls: MetadataRoute.Sitemap = [];

    const blogPromise = db.listDocuments(DB_ID, "blog_posts", [
      Query.equal("status", "published"),
      Query.orderDesc("publishedAt"),
      Query.limit(100),
      Query.select(["slug", "publishedAt", "updatedAt"]),
    ]);

    const jobsPromise = db.listDocuments(DB_ID, "jobs", [
      Query.equal("status", "active"),
      Query.orderDesc("createdAt"),
      Query.limit(100),
      Query.select(["$id", "createdAt", "updatedAt"]),
    ]);

    const [blogRes, jobsRes] = await Promise.all([
      blogPromise,
      jobsPromise,
    ]);

    for (const post of blogRes.documents) {
      urls.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const job of jobsRes.documents) {
      urls.push({
        url: `${BASE_URL}/jobs/${job.$id}`,
        lastModified: new Date(job.updatedAt || job.createdAt),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }

    return urls;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: page.priority,
  }));

  const dynamicUrls = await fetchDynamicUrls();

  return [...staticUrls, ...dynamicUrls];
}
