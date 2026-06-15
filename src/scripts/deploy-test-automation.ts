// Tranzlo Appwrite Function Deployment — Test Automation Engine
// Run: npx tsx src/scripts/deploy-test-automation.ts
//
// Requires: APPWRITE_API_KEY in .env.local
//
// This deploys ONE function that serves DUAL purposes:
//   1. EVENT trigger  → on new application, check if test should start
//   2. CRON trigger   → every hour, launch stale jobs + auto-fail expired tests

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ─── Load .env.local ────────────────────────────────────────────────────────
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
        if (!process.env[k]) process.env[k] = v;
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

if (!endpoint || !projectId || !apiKey) {
  console.error("❌ Missing required Appwrite variables in .env.local");
  process.exit(1);
}

const FUNCTION_ID = "tranzlo-test-automation";
const FUNCTION_NAME = "Tranzlo Translation Test Automation Engine";
const DATABASE_ID = databaseId || "tranzlo_main";

// Events: fires when a new application is created
const TRACKED_EVENTS = [
  `databases.${DATABASE_ID}.collections.applications.documents.create`,
];

// Cron: runs every hour on the hour
const CRON_SCHEDULE = "0 * * * *";

async function main() {
  const { Client, Functions } = await import("node-appwrite");
  const { InputFile } = await import("node-appwrite/file");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const functions = new Functions(client);

  // ── Prepare temp directory ────────────────────────────────────────────────
  console.log("🛠️  Preparing local function directory...");
  const tempDir = path.resolve(process.cwd(), "temp-test-automation");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const sourceCode = fs.readFileSync(
    path.resolve(process.cwd(), "src/scripts/appwrite-function-test-automation.js"),
    "utf-8"
  );
  fs.writeFileSync(path.resolve(tempDir, "index.js"), sourceCode);

  const packageJson = {
    name: "tranzlo-test-automation",
    version: "1.0.0",
    description: "Tranzlo Translation Test Lifecycle Automation",
    main: "index.js",
    dependencies: {
      "node-appwrite": "^24.1.0",
    },
  };
  fs.writeFileSync(path.resolve(tempDir, "package.json"), JSON.stringify(packageJson, null, 2));

  // ── Create archive ────────────────────────────────────────────────────────
  console.log("📦 Packaging deployment into deployment.tar.gz...");
  const tarPath = path.resolve(process.cwd(), "deployment.tar.gz");
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

  try {
    execSync(`tar -czf "${tarPath}" -C "${tempDir}" index.js package.json`);
    console.log("   ✅ Archive created.");
  } catch (err: any) {
    console.error("   ❌ Failed to create tar archive:", err.message);
    process.exit(1);
  }

  // ── Check / Create function ───────────────────────────────────────────────
  let funcExists = false;
  console.log(`🔍 Checking if function "${FUNCTION_ID}" already exists...`);
  try {
    await functions.get(FUNCTION_ID);
    funcExists = true;
    console.log("   ⚠️  Function already exists — will update.");
  } catch {
    console.log("   ✅ Function not found — creating new.");
  }

  if (!funcExists) {
    try {
      await functions.create(
        FUNCTION_ID,
        FUNCTION_NAME,
        "node-18.0" as any,
        [],             // execute permissions
        TRACKED_EVENTS, // listen for new application docs
        CRON_SCHEDULE,  // also run every hour
        300,            // 5-minute timeout
        true            // enabled
      );
      console.log("   ✅ Function created in Appwrite!");
    } catch (err: any) {
      console.error("   ❌ Failed to create function:", err.message);
      process.exit(1);
    }
  } else {
    try {
      await functions.update(
        FUNCTION_ID,
        FUNCTION_NAME,
        "node-18.0" as any,
        [],
        TRACKED_EVENTS,
        CRON_SCHEDULE,
        300,
        true
      );
      console.log("   ✅ Function updated (events + cron schedule).");
    } catch (err: any) {
      console.warn("   ⚠️  Failed to update function settings:", err.message);
    }
  }

  // ── Configure environment variables ──────────────────────────────────────
  console.log("⚙️  Configuring environment variables...");
  const vars: Record<string, string> = {
    APPWRITE_API_KEY: apiKey!,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: DATABASE_ID,
    NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint!,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: projectId!,
  };

  for (const [key, value] of Object.entries(vars)) {
    try {
      try {
        await functions.updateVariable(FUNCTION_ID, key, key, value);
        console.log(`   ✅ Variable: ${key} updated.`);
      } catch {
        await functions.createVariable(FUNCTION_ID, key, key, value);
        console.log(`   ✅ Variable: ${key} created.`);
      }
    } catch (err: any) {
      console.warn(`   ⚠️  Failed to configure ${key}:`, err.message);
    }
  }

  // ── Upload deployment archive ─────────────────────────────────────────────
  console.log("🚀 Uploading deployment archive to Appwrite...");
  try {
    const file = InputFile.fromPath(tarPath, "deployment.tar.gz");
    const deployment = await functions.createDeployment(
      FUNCTION_ID,
      file,
      true,        // activate immediately
      "index.js",  // entrypoint
      "npm install"
    );
    console.log(`   ✅ Deployment activated! (ID: ${deployment.$id})`);
  } catch (err: any) {
    console.error("   ❌ Failed to deploy:", err.message);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  console.log("🧹 Cleaning up...");
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
    console.log("   ✅ Cleaned.");
  } catch {}

  console.log("\n🏁 Test Automation Engine deployed successfully!\n");
  console.log("📋 What was deployed:");
  console.log("   ▸ EVENT trigger: fires on every new application → checks maxTestApplicants threshold");
  console.log("   ▸ CRON trigger (every hour): launches stale 24h-old jobs + auto-fails expired tests");
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
