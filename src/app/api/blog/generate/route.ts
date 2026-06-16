import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account, Databases, ID, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite-config";
import { BUCKETS } from "@/constants/buckets";
import axios from "axios";

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

export async function POST(req: Request) {
  try {
    const { competitorUrl, category } = await req.json();

    if (!competitorUrl || !category) {
      return NextResponse.json({ error: "competitorUrl and category are required" }, { status: 400 });
    }

    // 1. Authenticate user and verify admin role
    let authenticated = false;
    const userClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwt = authHeader.substring(7);
      userClient.setJWT(jwt);
      authenticated = true;
    } else {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(`a_session_${appwriteConfig.projectId}`) || cookieStore.get(`a_session_${appwriteConfig.projectId.toLowerCase()}`);
      if (sessionCookie) {
        userClient.setSession(sessionCookie.value);
        authenticated = true;
      }
    }

    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const account = new Account(userClient);
    let user;
    try {
      user = await account.get();
    } catch {
      return NextResponse.json({ error: "Unauthorized. Session invalid or expired." }, { status: 401 });
    }

    const userId = user.$id;
    const userRole = user.prefs?.role || "translator";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // 2. Scrape competitor article text content
    let competitorText = "";
    try {
      const scraperRes = await axios.get(competitorUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      });
      const html = scraperRes.data;
      const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      competitorText = pMatches
        .map((m: string) => m.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim())
        .filter((t: string) => t.length > 25)
        .slice(0, 15)
        .join("\n\n");
    } catch (err: any) {
      console.error("Failed to scrape competitor article:", err);
      return NextResponse.json({ error: `Failed to scrape competitor article: ${err.message}` }, { status: 400 });
    }

    if (!competitorText) {
      return NextResponse.json({ error: "No readable article paragraphs found at the competitor URL." }, { status: 400 });
    }

    // 3. OpenRouter Content Generation (using meta-llama/llama-3.3-70b-instruct:free model)
    let generatedPost;
    try {
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        throw new Error("OPENROUTER_API_KEY environment variable is not set.");
      }

      const aiRes = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-3.3-70b-instruct:free",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a world-class SEO content writer and strategist.
Your task is to analyze the provided competitor article text and generate an optimized, high-CTR blog post for Tranzlo (a translation marketplace) in English.
You MUST output ONLY a JSON object matching this schema:
{
  "title": "SEO Optimized Blog Title (50-60 characters, with main keyword in the front)",
  "slug": "lowercase-hyphen-separated-url-slug-3-6-words",
  "excerpt": "Compelling Meta Description (150-160 characters, including the main keyword and a clear CTA)",
  "content": "Fully-formed HTML article content. Must be 600-700 words, using ONLY clean <h2>, <h3>, <p>, <a> tags. Do NOT use markdown. Start directly with the intro paragraph. Naturally integrate the primary keyword in the first paragraph, and LSI variations throughout. Structure logical headings.",
  "primaryKeyword": "The primary keyword identified",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
  "imagePrompt": "A highly detailed, professional, descriptive visual prompt for generating a featured cover image representing this article. Focus on technology, translation, human-AI collaboration, with a premium, sleek blue/cyan aesthetic."
}`,
            },
            {
              role: "user",
              content: `Competitor Article Content:\n\n${competitorText}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        }
      );

      const resText = aiRes.data.choices[0].message.content;
      generatedPost = JSON.parse(resText);
    } catch (err: any) {
      console.error("OpenRouter generation failed:", err);
      return NextResponse.json({ error: `AI content generation failed: ${err.message}` }, { status: 500 });
    }

    // 4. Gemini Image Generation (using Imagen 3 model)
    let coverImage = "";
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set.");
      }

      const imagePrompt = generatedPost.imagePrompt || generatedPost.title;
      const imagenRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${geminiApiKey}`,
        {
          prompt: imagePrompt,
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "16:9",
        },
        {
          timeout: 30000,
        }
      );

      const imageBytes = imagenRes.data.generatedImages[0].image.imageBytes;
      const imageBuffer = Buffer.from(imageBytes, "base64");

      // Upload generated image to Appwrite storage
      const adminClient = new Client()
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId)
        .setKey(appwriteConfig.apiKey);

      const storage = new Storage(adminClient);
      const uploadedFile = await storage.createFile(
        BUCKETS.BLOG_MEDIA,
        ID.unique(),
        InputFile.fromBuffer(imageBuffer, `${generatedPost.slug}.jpg`)
      );

      coverImage = `${appwriteConfig.endpoint}/storage/buckets/${BUCKETS.BLOG_MEDIA}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}`;
    } catch (err: any) {
      console.error("Gemini image generation/upload failed:", err);
      // We don't fail the entire request, just proceed without cover image
      coverImage = "";
    }

    // 5. Create Draft Post in Appwrite Database
    const adminClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(appwriteConfig.apiKey);

    const databases = new Databases(adminClient);
    
    const postTags = [
      `Objective:${generatedPost.primaryKeyword}`,
      ...(generatedPost.secondaryKeywords || []),
    ];

    const draftDocument = await databases.createDocument(
      dbId,
      "blogPosts", // COLLECTION ID
      ID.unique(),
      {
        authorId: userId,
        title: generatedPost.title,
        slug: generatedPost.slug,
        excerpt: generatedPost.excerpt,
        content: generatedPost.content,
        coverImage: coverImage || undefined,
        imageAlt: generatedPost.primaryKeyword || "Blog Post Cover Image",
        tags: postTags,
        category: category,
        status: "pending_review",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "AI draft article generated and saved successfully.",
      post: draftDocument,
    });

  } catch (err: any) {
    console.error("API generate route encountered error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
