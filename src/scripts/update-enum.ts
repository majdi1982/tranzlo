import * as fs from "fs";
import * as path from "path";
import { Client, Databases } from "node-appwrite";

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
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
}

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

async function run() {
  if (!endpoint || !projectId || !apiKey) {
    console.error("Missing credentials");
    process.exit(1);
  }
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  try {
    console.log("Updating applications status enum...");
    await db.updateEnumAttribute(
      dbId,
      "applications",
      "status",
      ["submitted", "pending", "viewed", "shortlisted", "test_invited", "accepted", "rejected", "withdrawn"],
      false, // required
      "submitted" // xdefault
    );
    console.log("Successfully updated enum for applications.status");
  } catch (err: any) {
    console.error("Failed to update applications.status enum:", err.message);
  }
}

run();
