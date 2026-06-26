import * as fs from "fs";
import * as path from "path";

// Load env
const envPath = path.resolve(__dirname, "../../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      const eq = t.indexOf("=");
      if (eq > 0) {
        let v = t.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        const k = t.slice(0, eq).trim();
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

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

async function main() {
  const { Client, Databases } = await import("node-appwrite");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const databases = new Databases(client);

  console.log("Fetching documents...");
  const result = await databases.listDocuments(dbId, "blog_posts");
  console.log(`Found ${result.documents.length} posts:`);
  result.documents.forEach((d: any) => {
    console.log(`- [${d.status}] ID: ${d.$id} | Title: ${d.title} | Slug: ${d.slug} | CreatedAt: ${d.createdAt}`);
  });
}

main().catch(console.error);
