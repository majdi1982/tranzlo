// scratch/trigger-execution.ts
// Run: npx tsx scratch/trigger-execution.ts

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

  console.log(`🚀 Creating new execution for function: ${FUNCTION_ID}...`);
  try {
    const exec = await functions.createExecution(FUNCTION_ID);
    console.log(`Execution created successfully! ID: ${exec.$id}`);
    console.log(`Initial Status: ${exec.status}`);
    
    // Poll the execution status every 3 seconds until finished
    console.log("Polling status...");
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const current = await functions.getExecution(FUNCTION_ID, exec.$id);
      console.log(`[Status check ${i+1}] Status: ${current.status} (Duration: ${current.duration}s)`);
      if (current.status !== "waiting" && current.status !== "processing") {
        console.log(`----------------------------------------`);
        console.log(`Final Status: ${current.status}`);
        console.log(`Status Code:  ${current.statusCode}`);
        console.log(`Errors:       ${current.errors || "None"}`);
        console.log(`Stdout:       ${current.logs || "None"}`);
        break;
      }
    }
  } catch (err: any) {
    console.error("❌ Failed to execute function:", err.message);
  }
}

main();
