import { Client, Databases } from "node-appwrite";
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

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a156f9000335c99e9be";
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

async function run() {
  if (!apiKey) {
    console.error("❌ APPWRITE_API_KEY is missing in env");
    return;
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  console.log("🚀 Starting verification reset script...");

  // 1. Reset translators
  try {
    console.log("Fetching translator profiles...");
    const translators = await databases.listDocuments(dbId, "translator_profiles", []);
    console.log(`Found ${translators.documents.length} translators. Resetting...`);
    for (const doc of translators.documents) {
      await databases.updateDocument(dbId, "translator_profiles", doc.$id, {
        isVerified: false,
        verificationStatus: "unverified",
      });
      console.log(`   ✅ Reset translator profile: ${doc.fullName} (${doc.$id})`);
    }
  } catch (err: any) {
    console.error("❌ Error resetting translators:", err.message);
  }

  // 2. Reset companies
  try {
    console.log("Fetching company profiles...");
    const companies = await databases.listDocuments(dbId, "company_profiles", []);
    console.log(`Found ${companies.documents.length} companies. Resetting...`);
    for (const doc of companies.documents) {
      await databases.updateDocument(dbId, "company_profiles", doc.$id, {
        isVerified: false,
        verificationStatus: "unverified",
      });
      console.log(`   ✅ Reset company profile: ${doc.companyName} (${doc.$id})`);
    }
  } catch (err: any) {
    console.error("❌ Error resetting companies:", err.message);
  }

  console.log("🎉 Reset complete!");
}

run();
