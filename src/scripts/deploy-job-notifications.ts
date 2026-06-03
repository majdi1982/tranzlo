// Tranzlo Appwrite Function Deployment Automator for Job Notifications
// Run: npx tsx src/scripts/deploy-job-notifications.ts
//
// Requires: APPWRITE_API_KEY in .env.local

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// 1. Load Environment Variables from .env.local
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
  GEMINI_API_KEY: geminiApiKey,
  SMTP_HOST: smtpHost,
  SMTP_PORT: smtpPort,
  SMTP_USER: smtpUser,
  SMTP_PASSWORD: smtpPassword,
  SMTP_FROM: smtpFrom,
} = process.env;

if (!endpoint || !projectId || !apiKey) {
  console.error("❌ Missing required Appwrite variables in .env.local");
  process.exit(1);
}

const FUNCTION_ID = "tranzlo-job-notifications";
const FUNCTION_NAME = "Tranzlo Job Notifications Dispatcher";

const DATABASE_ID = databaseId || "tranzlo_main";

// Appwrite database events this function will listen to:
const TRACKED_EVENTS = [
  `databases.${DATABASE_ID}.collections.applications.documents.create`,
  `databases.${DATABASE_ID}.collections.applications.documents.update`
];

async function main() {
  const { Client, Functions } = await import("node-appwrite");
  const { InputFile } = await import("node-appwrite/file");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const functions = new Functions(client);

  console.log("🛠️ Preparing local function directory...");
  const tempDir = path.resolve(process.cwd(), "temp-job-notifications");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // 1. Write index.js (copied from appwrite-function-job-notifications.js)
  const sourceCode = fs.readFileSync(
    path.resolve(process.cwd(), "src/scripts/appwrite-function-job-notifications.js"),
    "utf-8"
  );
  fs.writeFileSync(path.resolve(tempDir, "index.js"), sourceCode);

  // 2. Write package.json with nodemailer dependency
  const packageJson = {
    name: "tranzlo-job-notifications",
    version: "1.0.0",
    description: "Tranzlo 3-Channel Job Notifications Dispatcher",
    main: "index.js",
    dependencies: {
      "node-appwrite": "^24.1.0",
      "nodemailer": "^6.9.9"
    }
  };
  fs.writeFileSync(
    path.resolve(tempDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  console.log("📦 Packaging deployment into deployment.tar.gz...");
  const tarPath = path.resolve(process.cwd(), "deployment.tar.gz");
  if (fs.existsSync(tarPath)) {
    fs.unlinkSync(tarPath);
  }

  // Compress using Windows native tar
  try {
    execSync(`tar -czf "${tarPath}" -C "${tempDir}" index.js package.json`);
    console.log("   ✅ Archive created successfully.");
  } catch (err: any) {
    console.error("   ❌ Failed to create tar archive:", err.message);
    process.exit(1);
  }

  let funcExists = false;
  console.log(`🔍 Checking if function "${FUNCTION_ID}" already exists...`);
  try {
    await functions.get(FUNCTION_ID);
    funcExists = true;
    console.log("   ⚠️ Function already exists.");
  } catch (err: any) {
    console.log("   ✅ Function doesn't exist, creating a new one...");
  }

  if (!funcExists) {
    try {
      await functions.create(
        FUNCTION_ID,
        FUNCTION_NAME,
        "node-18.0" as any, // Node 18.0 runtime
        [], // execute permissions
        TRACKED_EVENTS, // Appwrite Events to listen to
        "", // no CRON schedule needed
        300, // timeout (5 minutes)
        true // enabled
      );
      console.log("   ✅ Function created successfully in Appwrite!");
    } catch (createErr: any) {
      console.error("   ❌ Failed to create function in Appwrite:", createErr.message);
      process.exit(1);
    }
  } else {
    // Update existing function settings/events
    try {
      await functions.update(
        FUNCTION_ID,
        FUNCTION_NAME,
        "node-18.0" as any,
        [],
        TRACKED_EVENTS,
        "",
        300, // timeout
        true // enabled
      );
      console.log("   ✅ Function settings and Database Events updated successfully!");
    } catch (updateErr: any) {
      console.warn("   ⚠️ Failed to update function settings:", updateErr.message);
    }
  }

  // Update variables
  console.log("⚙️ Configuring Appwrite function environment variables...");
  const vars = {
    APPWRITE_API_KEY: apiKey!,
    GEMINI_API_KEY: geminiApiKey || "",
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: DATABASE_ID,
    NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint!,
    SMTP_HOST: smtpHost || "smtp.hostinger.com",
    SMTP_PORT: smtpPort || "465",
    SMTP_USER: smtpUser || "help@tranzlo.net",
    SMTP_PASSWORD: smtpPassword || "Cdromlg@8442",
    SMTP_FROM: smtpFrom || "support@tranzlo.net",
    OPEN_WA_API_URL: "http://187.124.179.33:2785/api/sessions/tranzlo/messages/send-text",
    OPEN_WA_API_KEY: "owa_k1_1a5d0207b454ff67bc2711564fc9073bee9730a83ee30351ae83148d57df991b"
  };

  for (const [key, value] of Object.entries(vars)) {
    try {
      try {
        await functions.updateVariable(FUNCTION_ID, key, key, value);
        console.log(`   ✅ Variable: ${key} updated.`);
      } catch (updateErr) {
        await functions.createVariable(FUNCTION_ID, key, key, value);
        console.log(`   ✅ Variable: ${key} created.`);
      }
    } catch (varErr: any) {
      console.warn(`   ⚠️ Failed to configure variable ${key}:`, varErr.message);
    }
  }

  console.log("🚀 Uploading deployment archive to Appwrite...");
  try {
    const file = InputFile.fromPath(tarPath, "deployment.tar.gz");
    const deployment = await functions.createDeployment(
      FUNCTION_ID,
      file,
      true, // Set as active deployment
      "index.js", // entrypoint
      "npm install" // commands to run on build
    );
    console.log(`   ✅ SUCCESS: Deployment created & activated! (ID: ${deployment.$id})`);
  } catch (deployErr: any) {
    console.error("   ❌ Failed to create deployment in Appwrite:", deployErr.message);
  }

  // Clean up
  console.log("🧹 Cleaning up temporary files...");
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (fs.existsSync(tarPath)) {
      fs.unlinkSync(tarPath);
    }
    console.log("   ✅ Cleaned.");
  } catch {}

  console.log("\n🏁 Deployment fully completed!");
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
