// Appwrite Function: RSS Auto-Publisher with Gemini AI
// Language: Node.js (v18+)
//
// Paste this code into your Appwrite Function index.js, or deploy it via Appwrite CLI.
// Make sure to add 'node-appwrite' to your function's package.json dependencies.

const { Client, Databases, Query } = require("node-appwrite");

const RSS_FEEDS = [
  "https://blog.google/rss/",
  "https://blog.google/technology/ai/rss/",
  "https://dev.to/feed/tag/translation",
  "https://dev.to/feed/tag/localization"
];

// Helper to sanitize XML/HTML and extract content
function cleanCDATA(str) {
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim();
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
  if (match) {
    return cleanCDATA(match[1]);
  }
  return "";
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper to extract cover images from RSS items (media:content, media:thumbnail, enclosure, or img tag)
function extractCoverImage(xml) {
  try {
    // 1. Try media:content or media:thumbnail
    let match = xml.match(/<(?:media:content|media:thumbnail)[^>]*url=["']([^"']+)["']/i);
    if (match) return match[1];

    // 2. Try enclosure
    match = xml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
    if (match) return match[1];

    // 3. Try img src inside description/content
    const desc = extractTag(xml, "description") || extractTag(xml, "content:encoded") || extractTag(xml, "content");
    if (desc) {
      match = desc.match(/<img[^>]*src=["']([^"']+)["']/i);
      if (match) return match[1];
    }
  } catch (err) {
    // ignore
  }
  return "";
}

// Generate high quality post contents & translate using Gemini AI
async function enrichAndTranslateWithGemini(title, rawContent, geminiApiKey, log, error) {
  if (!geminiApiKey) {
    log("⚠️ GEMINI_API_KEY env variable not found. Using raw English parsing.");
    return {
      titleAr: title,
      excerptAr: rawContent.slice(0, 150).replace(/<[^>]*>/g, "") + "...",
      contentAr: rawContent,
      tags: ["news", "general"],
      category: "general",
      imageAlt: "Translation chronicle cover image"
    };
  }

  const prompt = `
You are an expert tech writer and professional blogger for Tranzlo (a translation and localization platform).
Analyze this blog post title and description:
Title: "${title}"
Content/Description snippet: "${rawContent.slice(0, 1000)}"

Task:
1. Optimize the Title into a catchy, premium English blog title.
2. Write a professional English summary/excerpt (1-2 sentences, min 15 chars).
3. Generate a beautifully structured, premium English blog post content in Markdown (min 100 chars), expanding on the topic professionally to keep the readers of a translation/localization/tech platform engaged. Keep it clean, professional, and visually stunning.
4. Provide 3-5 relevant lowercase tags (e.g. technology, localization, ai, translation).
5. Categorize this post into one of these exact categories:
   - "translation-tech" (if the post is about AI translation, LLMs, neural translation, translation tools, CAT tools)
   - "linguistic-guides" (if it is about language tips, rules, legal/medical translation guides, Arabic formatting)
   - "freelance-career" (if it is about freelance translation tips, clients, rates, portfolios)
   - "industry-trends" (if it is about market trends, localization growth, globalization reports)
   - "general" (if it doesn't fit any of the above)
6. Write a descriptive, SEO-friendly image alt text (max 120 chars) for this post's cover image.

Return your output STRICTLY as a JSON object with this exact format, with no markdown code block backticks around it:
{
  "titleAr": "Optimized English title here",
  "excerptAr": "Optimized English excerpt here",
  "contentAr": "Optimized English full content here in Markdown format",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "translation-tech",
  "imageAlt": "Descriptive cover image alt text here"
}
`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResult) throw new Error("Empty response from Gemini");

    return JSON.parse(textResult.trim());
  } catch (err) {
    error("❌ Gemini enrichment failed: " + err.message);
    return {
      titleAr: `[News] ${title}`,
      excerptAr: `Article summary: ${title} in technology and translation.`,
      contentAr: `### ${title}\n\n${rawContent.replace(/<[^>]*>/g, "")}`,
      tags: ["news", "translation"],
      category: "general",
      imageAlt: "Translation chronicle cover image"
    };
  }
}

module.exports = async function (context) {
  const { req, res, log, error } = context;

  // Read environment variables (either from process.env or Appwrite Function variables)
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY; // API Key with Database/Collections read/write permission
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    error("❌ Missing required Appwrite environment variables (Endpoint, Project ID, or API Key).");
    return res.json({ success: false, error: "Environment variables configuration missing." }, 500);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  log("🚀 Starting RSS Auto-Publishing Appwrite Function...");
  const publishedTitles = [];

  for (const url of RSS_FEEDS) {
    log(`📡 Fetching Feed: ${url}`);
    try {
      const feedRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (!feedRes.ok) {
        error(`❌ Failed to fetch feed ${url}: ${feedRes.status}`);
        continue;
      }

      const text = await feedRes.text();
      const items = text.split("<item>");
      
      const blogItems = items.slice(1, 3); // Limit to top 2 articles per feed in functions to stay within execution limits
      log(`Found ${items.length - 1} articles. Processing top ${blogItems.length}...`);

      for (const itemXml of blogItems) {
        const originalTitle = extractTag(itemXml, "title");
        const originalLink = extractTag(itemXml, "link");
        const originalDesc = extractTag(itemXml, "description") || extractTag(itemXml, "content:encoded") || extractTag(itemXml, "content");
        
        if (!originalTitle || !originalLink) continue;

        const slug = generateSlug(originalTitle);
        log(`👉 Processing: "${originalTitle}" (Slug: ${slug})`);

        // Check if slug already exists in Appwrite to avoid duplicates
        try {
          const existing = await db.listDocuments(databaseId, "blog_posts", [
            Query.equal("slug", slug),
            Query.limit(1)
          ]);

          if (existing.documents.length > 0) {
            log(`   ⏭️ Already published. Skipping.`);
            continue;
          }
        } catch (dbErr) {
          error(`   ⚠️ DB check error: ${dbErr.message}`);
        }

        const coverImage = extractCoverImage(itemXml);
        log(`   📸 Extracted cover image: ${coverImage || "none"}`);

        log("   ✨ Translating and generating professional Arabic article with Gemini...");
        const enriched = await enrichAndTranslateWithGemini(originalTitle, originalDesc, geminiApiKey, log, error);

        log(`   💾 Saving post to Appwrite database...`);
        try {
          const now = new Date().toISOString();
          const docId = `post_${Math.random().toString(36).substring(2, 11)}`;
          
          await db.createDocument(databaseId, "blog_posts", docId, {
            authorId: "system_news_bot",
            title: enriched.titleAr,
            slug: slug,
            excerpt: enriched.excerptAr.slice(0, 490),
            content: enriched.contentAr.slice(0, 48000),
            coverImage: coverImage || "",
            tags: enriched.tags,
            category: enriched.category || "general",
            imageAlt: enriched.imageAlt || "Translation article cover image",
            status: "published",
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
          });

          log(`   ✅ SUCCESS: Post "${enriched.titleAr}" published!`);
          publishedTitles.push(enriched.titleAr);
        } catch (saveErr) {
          error(`   ❌ Failed to save post: ${saveErr.message}`);
        }
      }
    } catch (feedErr) {
      error(`❌ Error parsing feed ${url}: ${feedErr.message}`);
    }
  }

  log("🏁 RSS Auto-Publishing Job Finished successfully.");
  return res.json({ success: true, publishedCount: publishedTitles.length, published: publishedTitles });
};
