// Tranzlo Storage Buckets Setup
// Run: npx tsx src/scripts/setup-storage.ts
//
// Requires: APPWRITE_API_KEY in .env.local (server key with storage scope)

import * as fs from "fs";
import * as path from "path";

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
  console.error("❌ APPWRITE_API_KEY not found in .env.local");
  process.exit(1);
}

interface BucketDef {
  id: string;
  name: string;
  maxSize: number;
  extensions: string[];
}

const BUCKETS: BucketDef[] = [
  { id: "profile_images", name: "Profile Images", maxSize: 5_000_000, extensions: ["jpg", "jpeg", "png", "gif", "webp"] },
  { id: "translator_documents", name: "Translator Documents", maxSize: 10_000_000, extensions: ["pdf", "doc", "docx"] },
  { id: "company_documents", name: "Company Documents", maxSize: 10_000_000, extensions: ["pdf", "doc", "docx"] },
  { id: "certificates", name: "Certificates", maxSize: 10_000_000, extensions: ["pdf", "jpg", "jpeg", "png"] },
  { id: "blog_media", name: "Blog Media", maxSize: 20_000_000, extensions: ["jpg", "jpeg", "png", "gif", "webp", "mp4"] },
  { id: "hub_media", name: "Hub Media", maxSize: 20_000_000, extensions: ["jpg", "jpeg", "png", "gif", "webp", "mp4"] },
  { id: "complaint_attachments", name: "Complaint Attachments", maxSize: 10_000_000, extensions: ["pdf", "jpg", "jpeg", "png"] },
  { id: "dispute_attachments", name: "Dispute Attachments", maxSize: 10_000_000, extensions: ["pdf", "jpg", "jpeg", "png"] },
];

async function main() {
  for (const bucket of BUCKETS) {
    console.log(`Creating bucket: ${bucket.id}...`);
    try {
      const res = await fetch(`${endpoint}/storage/buckets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": projectId,
          "X-Appwrite-Key": apiKey,
        },
        body: JSON.stringify({
          bucketId: bucket.id,
          name: bucket.name,
          permission: "file",
          fileSecurity: true,
          enabled: true,
          maximumFileSize: bucket.maxSize,
          allowedFileExtensions: bucket.extensions,
          compressImage: "none",
          encryption: true,
          antivirus: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`  ✅ ${bucket.id} created`);
      } else {
        if (data.message?.includes("already exists")) {
          console.log(`  ⚠️  ${bucket.id} already exists`);
        } else {
          console.error(`  ❌ ${bucket.id}: ${data.message || JSON.stringify(data)}`);
        }
      }
    } catch (err) {
      console.error(`  ❌ ${bucket.id}: ${err}`);
    }
  }
}

main();
