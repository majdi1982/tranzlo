// Script to generate a WhatsApp Pairing Code for a phone number
// Run: npx tsx scratch/pair-phone.ts

import { create } from "@open-wa/wa-automate";
import * as fs from "fs";
import * as path from "path";

const PHONE_NUMBER = "970567140936"; // The user's phone number

async function main() {
  console.log(`🚀 Initializing local WhatsApp pairing session for: +${PHONE_NUMBER}...`);
  console.log("⏳ Opening browser (this may take a few seconds)...");

  try {
    const client = await create({
      sessionId: "TRANZLO_SESSION",
      authTimeout: 0,
      qrTimeout: 0,
      headless: true, // Run headlessly for clean CLI output
      multiDevice: true,
      logConsole: false
    });

    console.log("🔗 Requesting Pairing Code from WhatsApp...");
    // Retrieve pairing code from WhatsApp Web
    const pairingCode = await client.getPairingCode(PHONE_NUMBER);

    console.log("\n==================================================");
    console.log("🎉 SUCCESS! WHATSAPP PAIRING CODE GENERATED!");
    console.log("==================================================");
    console.log(`\n👉 Your Pairing Code:  ${pairingCode}\n`);
    console.log("==================================================");
    console.log("📱 HOW TO LINK ON YOUR PHONE:");
    console.log("1. Open WhatsApp on your phone.");
    console.log("2. Go to Settings -> Linked Devices -> Link a Device.");
    console.log("3. Select 'Link with phone number instead' at the bottom.");
    console.log(`4. Enter the code above: ${pairingCode}`);
    console.log("==================================================\n");

    console.log("⏳ Keeping browser open to complete authentication... Do not close this terminal!");
    
    // Poll connection state
    let dots = "";
    const interval = setInterval(async () => {
      dots = dots.length > 3 ? "" : dots + ".";
      process.stdout.write(`\rAwaiting link authorization on phone${dots}   `);
      
      const isConnected = await client.isConnected();
      if (isConnected) {
        clearInterval(interval);
        console.log("\n\n✅ CONNECTED! WhatsApp session successfully linked!");
        
        // Save session credentials
        const sessionState = await client.getSessionId();
        console.log(`   Session saved. You can now close this script.`);
        process.exit(0);
      }
    }, 2000);

  } catch (err: any) {
    console.error("❌ Failed to generate pairing code:", err.message);
  }
}

main().catch(console.error);
