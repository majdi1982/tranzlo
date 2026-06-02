// Script to start WhatsApp session and save QR code as a public image
// Run: npx tsx scratch/start-wa-session.ts

import * as fs from "fs";
import * as path from "path";

const API_KEY = "owa_k1_1a5d0207b454ff67bc2711564fc9073bee9730a83ee30351ae83148d57df991b";
const BASE_URL = "http://187.124.179.33:2785";
const SESSION_NAME = "tranzlo";

async function main() {
  console.log("🚀 Starting WhatsApp session 'tranzlo' on remote OpenWA Gateway...");

  // 0. Force terminate/delete existing session first to ensure a completely fresh QR code
  try {
    const listRes = await fetch(`${BASE_URL}/api/sessions`, {
      headers: { "Authorization": `Bearer ${API_KEY}` }
    });
    const sessions = await listRes.json();
    const existing = sessions.find((s: any) => s.name === SESSION_NAME);
    if (existing) {
      console.log(`   🧹 Terminating stale session ID: ${existing.id}...`);
      await fetch(`${BASE_URL}/api/sessions/${existing.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${API_KEY}` }
      });
      console.log("   Stale session cleared.");
      // Small pause to let Docker clean browser cache
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (err: any) {
    console.warn("   ⚠️ Warning during session cleanup:", err.message);
  }
  
  // 1. Create fresh Session
  let sessionId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        name: SESSION_NAME
      })
    });
    
    const data = await res.json();
    console.log("   Session status response:", data);
    sessionId = data.id || "";
  } catch (err: any) {
    console.error("   ❌ Failed to create session:", err.message);
  }

  if (!sessionId) {
    console.error("❌ Could not obtain sessionId. Exiting.");
    return;
  }

  // 1.5 Start the Session
  console.log(`🚀 Starting session initialization for ID: ${sessionId}...`);
  try {
    const startRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}/start`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      }
    });
    console.log("   Start session response:", await startRes.json());
  } catch (startErr: any) {
    console.warn("   ⚠️ Failed to start session:", startErr.message);
  }

  // 2. Poll QR Code quickly for fresh generation
  console.log(`⏳ Waiting 8 seconds for a fresh QR code on session: ${sessionId}...`);
  await new Promise((r) => setTimeout(r, 8000));

  console.log("🔍 Fetching QR code image from gateway...");
  try {
    const qrRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}/qr`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      }
    });

    if (!qrRes.ok) {
      throw new Error(`HTTP ${qrRes.status}: ${await qrRes.text()}`);
    }

    const qrData = await qrRes.json();
    const qrCodeBase64 = qrData.qrCode; // e.g. "data:image/png;base64,iVBOR..."

    if (!qrCodeBase64 || !qrCodeBase64.includes("base64,")) {
      console.log("ℹ️ Gateway returned status:", qrData.status);
      console.log("⚠️ QR code not ready yet or session already authenticated! Please try running the script again in 5 seconds.");
      return;
    }

    const base64Data = qrCodeBase64.split("base64,")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const outputPath = path.resolve(process.cwd(), "public/wa-qr.png");
    fs.writeFileSync(outputPath, buffer);

    console.log("\n==================================================");
    console.log("✅ SUCCESS! QR Code Image saved successfully!");
    console.log(`📂 Location: ${outputPath}`);
    console.log(`🌐 URL to scan: https://tranzlo.net/wa-qr.png`);
    console.log("==================================================\n");

  } catch (err: any) {
    console.error("❌ Failed to fetch QR code:", err.message);
  }
}

main().catch(console.error);
