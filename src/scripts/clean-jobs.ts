import * as fs from "fs";
import * as path from "path";

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
} = process.env;

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

if (!endpoint || !projectId || !apiKey) {
  console.error("❌ Missing env vars");
  process.exit(1);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { Client, Databases } = await import("node-appwrite");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const db = new Databases(client);

  const collectionsToClean = [
    "jobs",
    "applications",
    "conversations",
    "messages",
    "notifications",
    "transactions_ledger",
    "invoices",
    "disputes",
  ];

  for (const collectionId of collectionsToClean) {
    console.log(`Cleaning collection: ${collectionId}`);
    try {
      let hasMore = true;
      while (hasMore) {
        const result = await db.listDocuments(DATABASE_ID, collectionId, []);
        if (result.documents.length === 0) {
          hasMore = false;
        } else {
          for (const doc of result.documents) {
            await db.deleteDocument(DATABASE_ID, collectionId, doc.$id);
          }
          console.log(`Deleted ${result.documents.length} documents from ${collectionId}`);
        }
      }
    } catch (err: any) {
      console.error(`Failed to clean ${collectionId}:`, err.message);
    }
  }
  
  console.log("✅ Cleanup complete!");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
