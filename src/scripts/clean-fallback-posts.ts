// Tranzlo Database Cleaner: Remove fallback system posts
// Run: npx tsx src/scripts/clean-fallback-posts.ts

import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
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
}

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: projectId,
  APPWRITE_API_KEY: apiKey,
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: databaseId,
} = process.env;

const DB_ID = databaseId || "tranzlo_main";

async function main() {
  const { Client, Databases, Query } = await import("node-appwrite");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const db = new Databases(client);

  console.log("🧹 Fetching system posts to clean up...");
  try {
    const response = await db.listDocuments(DB_ID, "blog_posts", [
      Query.equal("authorId", "system_news_bot"),
      Query.limit(100)
    ]);

    console.log(`Found ${response.documents.length} system posts.`);
    for (const doc of response.documents) {
      console.log(`🗑️ Deleting: "${doc.title}" (ID: ${doc.$id})`);
      await db.deleteDocument(DB_ID, "blog_posts", doc.$id);
    }
    console.log("✅ All low-quality fallback posts have been deleted!");
  } catch (err: any) {
    console.error("❌ Failed to clean database:", err.message);
  }
}

main();
