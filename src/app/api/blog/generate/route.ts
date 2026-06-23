import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account, Databases, ID, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite-config";
import { BUCKETS } from "@/constants/buckets";
import { BLOG_CATEGORY_MAP } from "@/constants/categories";
import axios from "axios";

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

const SYSTEM_PROMPT = `You are a world-class SEO content writer specializing in the translation and localization industry for Tranzlo (a freelance translation marketplace).

Brand Voice: Professional, authoritative, data-driven, optimistic about technology, practical for freelancers and businesses.

Your task is to analyze the provided competitor article and generate a superior, optimized blog post.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no backticks, no code blocks
2. Content MUST be in Markdown format using ## for H2 and ### for H3 headings
3. Content MUST be 1000-1500 words for strong SEO depth
4. Naturally integrate the primary keyword in the first paragraph
5. Write for translators, localization managers, and language service buyers
6. Each H2 section must be 150-250 words with practical insights
7. Include specific data points, statistics, or actionable tips

Output JSON schema:
{
  "title": "SEO Title (50-60 chars, primary keyword near the front, compelling)",
  "slug": "kebab-case-url-slug-3-6-words",
  "excerpt": "Meta description (150-160 chars, include primary keyword + CTA)",
  "content": "Full article in Markdown. Use ## for H2, ### for H3. Minimum 1000 words.",
  "primaryKeyword": "The main SEO keyword for this article",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
  "imagePrompt": "Detailed prompt for generating a professional cover image. Style: sleek, modern, blue/cyan aesthetic, representing translation/localization.",
  "category": "Map to one of: translation-tech, career-growth, industry-trends, best-practices, platform-news, general"
}`;

async function generateWithGemini(prompt: string, apiKey: string): Promise<any> {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    },
    { timeout: 60000 }
  );
  const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return JSON.parse(text.trim());
}

async function generateWithOpenRouter(prompt: string, apiKey: string): Promise<any> {
  const models = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-4-31b-it:free",
    "openrouter/free",
  ];

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        },
        {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          timeout: 45000,
        }
      );
      const text = res.data.choices[0].message.content.trim();
      const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      return JSON.parse(cleaned);
    } catch (e) {
      continue;
    }
  }
  throw new Error("All OpenRouter models failed");
}

function extractContent(html: string): string {
  const paragraphs: string[] = [];
  const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const m of matches) {
    const clean = m.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (clean.length > 25) paragraphs.push(clean);
    if (paragraphs.length >= 30) break;
  }

  // Also try to get headings for structure
  const headings: string[] = [];
  const hMatches = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) || [];
  for (const m of hMatches) {
    const clean = m.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (clean.length > 10) headings.push(clean);
  }

  return [...headings, ...paragraphs].join("\n\n").slice(0, 5000);
}

export async function POST(req: Request) {
  try {
    const { competitorUrl, category } = await req.json();
    if (!competitorUrl) {
      return NextResponse.json({ error: "competitorUrl is required" }, { status: 400 });
    }

    // 1. Authenticate
    const userClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      userClient.setJWT(authHeader.substring(7));
    } else {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(`a_session_${appwriteConfig.projectId}`) || cookieStore.get(`a_session_${appwriteConfig.projectId.toLowerCase()}`);
      if (sessionCookie) userClient.setSession(sessionCookie.value);
    }

    const account = new Account(userClient);
    let user;
    try {
      user = await account.get();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.prefs?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2. Scrape competitor article
    let competitorText = "";
    try {
      const res = await axios.get(competitorUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });
      competitorText = extractContent(res.data);
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to scrape article: ${err.message}` }, { status: 400 });
    }

    if (!competitorText || competitorText.length < 50) {
      return NextResponse.json({ error: "No meaningful content found at the URL" }, { status: 400 });
    }

    // 3. Generate article
    const userPrompt = `Competitor Article Content:\n\n${competitorText}\n\nCategory hint: ${category || "general"}\n\nGenerate the optimized blog post now.`;

    let geminiApiKey = process.env.GEMINI_API_KEY;
    let openRouterKey = process.env.OPENROUTER_API_KEY;
    let generated: any = null;
    let method = "ai";

    // Try Gemini first (better quality)
    if (geminiApiKey) {
      try {
        generated = await generateWithGemini(`${SYSTEM_PROMPT}\n\n${userPrompt}`, geminiApiKey);
        method = "ai";
      } catch (err: any) {
        console.warn("Gemini failed, falling back to OpenRouter:", err.message);
      }
    }

    // Fallback to OpenRouter
    if (!generated && openRouterKey) {
      try {
        generated = await generateWithOpenRouter(userPrompt, openRouterKey);
        method = "ai";
      } catch (err: any) {
        console.error("All AI models failed:", err.message);
      }
    }

    if (!generated || !generated.title || !generated.content) {
      return NextResponse.json({ error: "AI generation failed after all attempts" }, { status: 400 });
    }

    // 4. Calculate metrics
    const wordCount = generated.content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const mappedCategory = BLOG_CATEGORY_MAP[generated.category || category || "general"] || category || "general";

    // 5. Generate cover image with Gemini Imagen
    let coverImage = "";
    if (geminiApiKey) {
      try {
        const imagePrompt = generated.imagePrompt || `${generated.title} - professional blog cover image translation technology sleek blue cyan`;
        const imagenRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${geminiApiKey}`,
          { prompt: imagePrompt, numberOfImages: 1, outputMimeType: "image/jpeg", aspectRatio: "16:9" },
          { timeout: 30000 }
        );
        const bytes = imagenRes.data.generatedImages?.[0]?.image?.imageBytes;
        if (bytes) {
          const adminClient = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.projectId)
            .setKey(appwriteConfig.apiKey);
          const storage = new Storage(adminClient);
          const file = await storage.createFile(
            BUCKETS.BLOG_MEDIA, ID.unique(),
            InputFile.fromBuffer(Buffer.from(bytes, "base64"), `${generated.slug || "post"}.jpg`)
          );
          coverImage = `${appwriteConfig.endpoint}/storage/buckets/${BUCKETS.BLOG_MEDIA}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;
        }
      } catch (err: any) {
        console.warn("Image generation failed (non-fatal):", err.message);
      }
    }

    // 6. Save to Appwrite
    const adminClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(appwriteConfig.apiKey);
    const databases = new Databases(adminClient);

    const tags = [
      `Objective:${generated.primaryKeyword || generated.title}`,
      ...(generated.secondaryKeywords || []).slice(0, 4),
    ];

    const post = await databases.createDocument(dbId, "blog_posts", ID.unique(), {
      authorId: user.$id,
      title: generated.title,
      slug: generated.slug || generated.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      excerpt: (generated.excerpt || "").slice(0, 500),
      content: generated.content,
      coverImage: coverImage || undefined,
      imageAlt: generated.imagePrompt?.slice(0, 120) || generated.primaryKeyword || "Blog post cover image",
      tags,
      category: mappedCategory,
      primaryKeyword: generated.primaryKeyword || "",
      wordCount,
      readingTime,
      generatedBy: method,
      status: "pending_review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Article generated and saved", post });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 400 });
  }
}
