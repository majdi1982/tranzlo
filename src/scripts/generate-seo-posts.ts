import * as fs from "fs";
import * as path from "path";
import axios from "axios";

// Load .env.local
const envPath = path.resolve(__dirname, "../../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found");
  process.exit(1);
}

for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#")) {
    const eq = t.indexOf("=");
    if (eq > 0) {
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      const k = t.slice(0, eq).trim();
      if (!process.env[k]) {
        process.env[k] = v;
      }
    }
  }
}

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: projectId,
  APPWRITE_API_KEY: apiKey,
  GEMINI_API_KEY: geminiApiKey,
} = process.env;

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

if (!endpoint || !projectId || !apiKey || !geminiApiKey) {
  console.error("❌ Missing required environment variables in .env.local");
  process.exit(1);
}

const TOPICS = [
  {
    topic: "How to Hire the Best Freelance Translators: A Business Guide to Localization",
    category: "best-practices",
    fallbackImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
  },
  {
    topic: "Why AI + Human Translation (MTPE) is the Future of Global Business",
    category: "translation-tech",
    fallbackImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    topic: "Linguist's Guide: How to Increase Your Translation Earnings on Tranzlo",
    category: "career-growth",
    fallbackImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80"
  }
];

const SYSTEM_PROMPT = `You are a world-class SEO content writer specializing in the translation and localization industry for Tranzlo (a freelance translation marketplace).

Brand Voice: Professional, authoritative, data-driven, practical for freelancers and business buyers.
Language: English only. No translation, no Arabic.

Your task is to write a comprehensive, search-optimized blog post on the provided topic.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown wrapper, no backticks, no code block symbols
2. Content MUST be in Markdown format using ## for H2 and ### for H3 headings
3. Content MUST be between 1000 and 1500 words for strong SEO depth and E-E-A-T value
4. Naturally integrate the primary keyword in the first paragraph
5. Address localization buyers, translators, and language service buyers
6. Each section must provide deep, actionable insights and practical value
7. Include specific data points, statistics, or steps
8. Strictly return a JSON object matching the output schema. Do not write anything outside this JSON.

Output JSON schema:
{
  "title": "Catchy SEO Title (50-60 chars, include primary keyword)",
  "slug": "kebab-case-url-slug-3-6-words",
  "excerpt": "Meta description (150-160 chars, including primary keyword + CTA)",
  "content": "Full article in Markdown. Minimum 1000 words.",
  "primaryKeyword": "Main SEO keyword",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
  "imagePrompt": "Detailed prompt for generating a professional blog cover image. Style: sleek, modern, blue/cyan aesthetic, representing translation/localization."
}`;

async function main() {
  const { Client, Databases, Storage, ID, InputFile } = await import("node-appwrite");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const databases = new Databases(client);
  const storage = new Storage(client);

  console.log("🚀 Initializing SEO Blog Post Generator...");

  for (const t of TOPICS) {
    console.log(`\n📝 Generating article for topic: "${t.topic}"...`);
    try {
      // 1. Generate text content
      const userPrompt = `Topic: "${t.topic}"\nCategory: "${t.category}"\n\nGenerate the complete optimized blog post according to the system prompt guidelines.`;
      
      const textRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        },
        { timeout: 90000 }
      );

      const text = textRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty Gemini response");
      
      const generated = JSON.parse(text.trim());
      console.log(`   ✨ Content generated successfully! Title: "${generated.title}"`);

      // 2. Generate Cover Image using Gemini Imagen
      let coverImage = "";
      try {
        console.log("   🎨 Generating featured cover image via Imagen...");
        const imagePrompt = generated.imagePrompt || `${generated.title} - professional blog cover image, sleek blue cyan vector graphic`;
        const imagenRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${geminiApiKey}`,
          { prompt: imagePrompt, numberOfImages: 1, outputMimeType: "image/jpeg", aspectRatio: "16:9" },
          { timeout: 30000 }
        );
        const bytes = imagenRes.data.generatedImages?.[0]?.image?.imageBytes;
        if (bytes) {
          const file = await storage.createFile(
            "blog_media",
            ID.unique(),
            InputFile.fromBuffer(Buffer.from(bytes, "base64"), `${generated.slug || "post"}.jpg`)
          );
          coverImage = `${endpoint}/storage/buckets/blog_media/files/${file.$id}/view?project=${projectId}`;
          console.log(`   ✅ Image generated and saved to storage: ${file.$id}`);
        }
      } catch (imgErr: any) {
        console.warn(`   ⚠️ Image generation failed, using fallback: ${imgErr.message}`);
        coverImage = t.fallbackImage;
      }

      // 3. Save to database
      const wordCount = generated.content.trim().split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      const tags = [
        `Objective:${generated.primaryKeyword || generated.title}`,
        ...(generated.secondaryKeywords || []).slice(0, 4)
      ];

      const docId = `post_${Math.random().toString(36).substring(2, 11)}`;
      await databases.createDocument(dbId, "blog_posts", docId, {
        authorId: "system_seo_generator",
        title: generated.title,
        slug: generated.slug || generated.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        excerpt: (generated.excerpt || "").slice(0, 500),
        content: generated.content,
        coverImage: coverImage,
        imageAlt: generated.imagePrompt?.slice(0, 120) || generated.primaryKeyword || "Blog post cover image",
        tags,
        category: t.category,
        primaryKeyword: generated.primaryKeyword || "",
        wordCount,
        readingTime,
        generatedBy: "ai",
        status: "pending_review",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log(`   ✅ SUCCESS: Post saved to queue!`);

    } catch (err: any) {
      console.error(`   ❌ Failed to generate post: ${err.message}`);
    }
  }

  console.log("\n🏁 All SEO posts generated.");
}

main().catch((e) => {
  console.error("Fatal Error:", e);
  process.exit(1);
});
