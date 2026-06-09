import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as readline from "readline";
import { URL } from "url";
import { google } from "googleapis";

const envPath = path.resolve(process.cwd(), ".env.local");

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("==================================================");
  console.log("🔑    GOOGLE DRIVE OAUTH2 CREDENTIAL GENERATOR   ");
  console.log("==================================================");

  // Load .env.local if available to get Client ID & Client Secret
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

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from .env.local");
    console.log("\nPlease add them to your local d:\\Tranzlo\\.env.local file first:");
    console.log("GOOGLE_CLIENT_ID=your_client_id_here");
    console.log("GOOGLE_CLIENT_SECRET=your_client_secret_here");
    process.exit(1);
  }


  const redirectUri = "http://127.0.0.1:8085";
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);


  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
    prompt: "consent",
  });

  console.log("\n==================================================");
  console.log("👉 Open this URL in your web browser to authorize the app:");
  console.log(authUrl);
  console.log("==================================================");
  console.log("Waiting for authorization redirect on port 8085...\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const urlObj = new URL(req.url || "", `http://${req.headers.host}`);
        const authCode = urlObj.searchParams.get("code");
        if (authCode) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end("<h1>Success!</h1><p>Authorization successful. You can close this tab now and return to the terminal.</p>");
          server.close();
          resolve(authCode);
        } else {
          res.writeHead(400);
          res.end("Authorization code not found in query parameters.");
        }
      } catch (err) {
        res.writeHead(500);
        res.end("Internal server error.");
        reject(err);
      }
    });

    server.listen(8085, () => {
      // Server started
    });
  });

  try {
    console.log("🔄 Exchanging authorization code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ Tokens retrieved successfully!");
    
    if (!tokens.refresh_token) {
      console.warn("\n⚠️  WARNING: No refresh token returned. Google only sends it the FIRST time you authorize.");
      console.warn("   To fix this, go to your Google Account security settings, revoke access for 'Tranzlo Backup Client', and run this script again.");
    }

    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
    envContent = envContent
      .split("\n")
      .filter(line => !line.startsWith("GOOGLE_CLIENT_ID=") && !line.startsWith("GOOGLE_CLIENT_SECRET=") && !line.startsWith("GOOGLE_REFRESH_TOKEN="))
      .join("\n");

    const newLines = `
# Google OAuth2 Credentials (for Backup)
GOOGLE_CLIENT_ID=${clientId}
GOOGLE_CLIENT_SECRET=${clientSecret}
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token || ""}
`;

    fs.writeFileSync(envPath, envContent.trim() + "\n" + newLines.trim() + "\n");
    console.log("\n🎉 Success! Saved OAuth2 credentials to .env.local.");
    console.log("   Now run your deployment to sync these keys to the VPS.");

  } catch (err: any) {
    console.error("❌ Failed to retrieve tokens:", err.message);
  }
}

main().catch(console.error);
