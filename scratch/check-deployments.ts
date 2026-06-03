// scratch/check-deployments.ts
// Run: npx tsx scratch/check-deployments.ts

import * as fs from "fs";
import * as path from "path";

// Load Environment Variables from .env.local
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
} = process.env;

const FUNCTION_ID = "rss-auto-publisher";

async function main() {
  const { Client, Functions } = await import("node-appwrite");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const functions = new Functions(client);

  console.log(`🔍 Fetching deployments for function: ${FUNCTION_ID}...`);
  try {
    const response = await functions.listDeployments(FUNCTION_ID);
    console.log(`Found ${response.total} deployments.`);
    
    for (const dep of response.deployments) {
      console.log(`----------------------------------------`);
      console.log(`Deployment ID: ${dep.$id}`);
      console.log(`Active:        ${dep.active}`);
      console.log(`Entrypoint:    ${dep.entrypoint}`);
      console.log(`Build Command: ${dep.commands}`);
      console.log(`Status:        ${dep.status}`);
      console.log(`Build Time:    ${dep.buildTime || 0}s`);
      console.log(`Created At:    ${dep.$createdAt}`);
      console.log(`Build Logs:    ${dep.buildLogs || "None"}`);
    }
  } catch (err: any) {
    console.error("❌ Failed to list deployments:", err.message);
  }
}

main();
