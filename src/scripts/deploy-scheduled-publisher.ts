import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

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
  NEXT_PUBLIC_APP_URL: appUrl,
  TWITTER_BEARER_TOKEN: twitterToken,
  FACEBOOK_PAGE_ACCESS_TOKEN: fbToken,
  LINKEDIN_ACCESS_TOKEN: linkedinToken,
} = process.env;

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing required Appwrite variables in .env.local");
  process.exit(1);
}

const FUNCTION_ID = "tranzlo-scheduled-publisher";
const FUNCTION_NAME = "Tranzlo Scheduled Post Publisher";

async function main() {
  const { Client, Functions } = await import("node-appwrite");
  const { InputFile } = await import("node-appwrite/file");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const functions = new Functions(client);

  console.log("Preparing local function directory...");
  const tempDir = path.resolve(process.cwd(), "temp-scheduled-publisher");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const sourceCode = fs.readFileSync(
    path.resolve(process.cwd(), "src/scripts/appwrite-function-scheduled-publisher.js"),
    "utf-8"
  );
  fs.writeFileSync(path.resolve(tempDir, "index.js"), sourceCode);

  const packageJson = {
    name: "tranzlo-scheduled-publisher",
    version: "1.0.0",
    description: "Publishes scheduled blog posts and shares to social media",
    main: "index.js",
    dependencies: { "node-appwrite": "^24.1.0" },
  };
  fs.writeFileSync(path.resolve(tempDir, "package.json"), JSON.stringify(packageJson, null, 2));

  console.log("Packaging deployment...");
  const tarPath = path.resolve(process.cwd(), "deployment.tar.gz");
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

  execSync(`tar -czf "${tarPath}" -C "${tempDir}" index.js package.json`);

  let funcExists = false;
  try {
    await functions.get(FUNCTION_ID);
    funcExists = true;
  } catch {}

  const cronSchedule = "*/10 * * * *";

  if (!funcExists) {
    await functions.create(FUNCTION_ID, FUNCTION_NAME, "node-18.0" as any, [], [], cronSchedule, 300, true);
    console.log("Function created!");
  } else {
    await functions.update(FUNCTION_ID, FUNCTION_NAME, "node-18.0" as any, [], [], cronSchedule, 300, true);
    console.log("Function updated!");
  }

  const vars: Record<string, string> = {
    APPWRITE_API_KEY: apiKey!,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: databaseId || "tranzlo_main",
    NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint!,
    NEXT_PUBLIC_APP_URL: appUrl || "https://tranzlo.net",
  };
  const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const linkedinOrgId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (twitterToken) vars.TWITTER_BEARER_TOKEN = twitterToken;
  if (fbToken) vars.FACEBOOK_PAGE_ACCESS_TOKEN = fbToken;
  if (linkedinToken) vars.LINKEDIN_ACCESS_TOKEN = linkedinToken;
  if (linkedinOrgId) vars.LINKEDIN_ORGANIZATION_ID = linkedinOrgId;

  for (const [key, value] of Object.entries(vars)) {
    try {
      try {
        await functions.updateVariable(FUNCTION_ID, key, key, value);
      } catch {
        await functions.createVariable(FUNCTION_ID, key, key, value);
      }
    } catch (e: any) {
      console.warn(`Warning: Failed to set variable ${key}: ${e.message}`);
    }
  }

  console.log("Uploading deployment...");
  const file = InputFile.fromPath(tarPath, "deployment.tar.gz");
  await functions.createDeployment(FUNCTION_ID, file, true, "index.js", "npm install");
  console.log("SUCCESS: Scheduled Publisher deployed!");

  fs.rmSync(tempDir, { recursive: true, force: true });
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
