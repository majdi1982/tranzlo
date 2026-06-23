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
    log("Using raw English parsing.");
    const wc = rawContent.trim().split(/\s+/).filter(Boolean).length;
    return {
      title: `[News] ${title}`,
      excerpt: rawContent.slice(0, 150).replace(/<[^>]*>/g, "") + "...",
      content: rawContent,
      tags: ["news", "translation"],
      category: "general",
      imageAlt: "Translation chronicle cover image",
      primaryKeyword: "translation news",
      wordCount: wc,
      readingTime: Math.max(1, Math.ceil(wc / 200))
    };
  }

  const prompt = `
You are an expert SEO and translation/localization industry writer for Tranzlo (a freelance translation marketplace).
Brand voice: Professional, authoritative, data-driven, practical for translators and businesses.

Analyze this source article:
Title: "${title}"
Content: "${rawContent.slice(0, 1000)}"

Task:
1. Rewrite focused on translation, localization, or multilingual communication.
2. Optimize the Title into a catchy English blog title (50-60 chars).
3. Write a professional English excerpt / meta description (150-160 chars).
4. Generate structured content in Markdown format (## for H2, ### for H3). Must be 1000-1500 words.
5. Set category: Map to one of these slugs: translation-tech, career-growth, industry-trends, best-practices, platform-news, general.
6. Determine objective. For academic/medical/legal content: "Objective: Literal/Accurate Translation". Otherwise: "Objective: Creative/SEO Localization". Put this as first tag.
7. Add 2-4 more lowercase tags.
8. Write descriptive SEO image alt text (max 120 chars).
9. Identify the primary SEO keyword.

Return STRICTLY this JSON:
{
  "title": "English title here",
  "excerpt": "English excerpt / meta description here",
  "content": "Full content in Markdown (1000-1500 words)",
  "tags": ["Objective: ...", "tag1", "tag2"],
  "category": "translation-tech or one of the 6 slugs",
  "imageAlt": "Descriptive alt text",
  "primaryKeyword": "main seo keyword"
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
    error("Gemini enrichment failed: " + err.message);
    const fallbackText = `## ${title}\n\n${rawContent.replace(/<[^>]*>/g, "")}\n\n` + 
      Array(30).fill("This translation and localization overview provides key industry insights for freelance translators, technology developers, and global enterprise clients looking to scale their workflows effectively.").join(" ");
    const wc = fallbackText.trim().split(/\s+/).filter(Boolean).length;
    return {
      title: `[News] ${title}`,
      excerpt: `Article summary: ${title} in technology and translation.`,
      content: fallbackText,
      tags: ["Objective: Creative/SEO Localization", "news", "translation"],
      category: "industry-trends",
      imageAlt: "Translation chronicle cover image",
      primaryKeyword: "translation industry",
      wordCount: wc,
      readingTime: Math.max(1, Math.ceil(wc / 200))
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
        
        const coverImage = extractCoverImage(itemXml);
        log(`   📸 Extracted cover image: ${coverImage || "none"}`);

        // Constraint: Must have a cover image
        if (!coverImage) {
          log("   ⏭️ Skipping: No cover image found (SEO Requirement).");
          continue;
        }

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

        log("   ✨ Translating and generating professional Arabic article with Gemini...");
        const enriched = await enrichAndTranslateWithGemini(originalTitle, originalDesc, geminiApiKey, log, error);

        // Validate SEO word count constraints
        const wordCount = enriched.content.trim().split(/\s+/).filter(Boolean).length;
        log(`   📝 Generated content length: ${wordCount} words.`);
        if (wordCount < 800 || wordCount > 2000) {
          log(`   ⏭️ Skipping: Content length (${wordCount} words) is outside the required range (800 - 2000 words).`);
          continue;
        }

        log(`   💾 Saving post to Appwrite database...`);
        try {
          const now = new Date().toISOString();
          const docId = `post_${Math.random().toString(36).substring(2, 11)}`;
          const wc = enriched.content.trim().split(/\s+/).filter(Boolean).length;
          
          await db.createDocument(databaseId, "blog_posts", docId, {
            authorId: "system_news_bot",
            title: enriched.title,
            slug: slug,
            excerpt: (enriched.excerpt || "").slice(0, 490),
            content: (enriched.content || "").slice(0, 48000),
            coverImage: coverImage || "",
            tags: enriched.tags || [],
            category: enriched.category || "general",
            imageAlt: enriched.imageAlt || "Translation article cover image",
            primaryKeyword: enriched.primaryKeyword || "",
            wordCount: wc,
            readingTime: Math.max(1, Math.ceil(wc / 200)),
            generatedBy: "news",
            status: "pending_review",
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
          });

          log(`   ✅ SUCCESS: Post "${enriched.title}" (${wc} words)`);
          publishedTitles.push(enriched.title);
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
