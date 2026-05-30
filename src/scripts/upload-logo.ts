// Upload logo using Appwrite SDK
// Run: npx tsx src/scripts/upload-logo.ts

import * as fs from "fs";
import * as path from "path";
import { Client, Storage, ID } from "node-appwrite";

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
      process.env[t.slice(0, eq).trim()] = v;
    }
  }
}

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const apiKey = process.env.APPWRITE_API_KEY || "";

if (!apiKey) {
  console.error("❌ APPWRITE_API_KEY not found");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const storage = new Storage(client);
const BUCKET_ID = "site_assets";
const logoPath = path.resolve(__dirname, "../../public/logo.jpg");

async function main() {
  console.log("Uploading logo to site_assets bucket...");

  try {
    // Delete existing logo if any
    const existing = await storage.listFiles(BUCKET_ID);
    for (const file of existing.files) {
      if (file.name === "logo.jpg") {
        console.log(`  Deleting existing: ${file.$id}`);
        await storage.deleteFile(BUCKET_ID, file.$id);
      }
    }

    // Upload new logo
    const fileBuffer = fs.readFileSync(logoPath);
    const file = new File([fileBuffer], "logo.jpg", { type: "image/jpeg" });

    const result = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    );

    console.log(`  ✅ Logo uploaded: ${result.$id}`);
    console.log(`  URL: ${endpoint}/storage/buckets/${BUCKET_ID}/files/${result.$id}/view`);
  } catch (err) {
    console.error(`  ❌ Error: ${err}`);
  }
}

main();
