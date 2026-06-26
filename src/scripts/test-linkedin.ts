import * as fs from "fs";
import * as path from "path";
import axios from "axios";

// Load env
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
        process.env[k] = v;
      }
    }
  }
}

const token = process.env.LINKEDIN_ACCESS_TOKEN;

async function main() {
  if (!token) {
    console.error("No LINKEDIN_ACCESS_TOKEN found");
    return;
  }
  
  console.log("Checking LinkedIn Token Owner...");
  try {
    const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS! Profile details:", profileRes.data);
  } catch (err: any) {
    console.error("FAILED:", err.response?.data || err.message);
  }
}

main();
