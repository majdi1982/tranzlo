const { create, Client } = require("@open-wa/wa-automate");
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8084;
const API_KEY = process.env.OPEN_WA_API_KEY || "tranzloSecretKey";

let waClient = null;
let isReady = false;

console.log("🚀 Starting open-wa WhatsApp Gateway for Tranzlo...");

create({
  sessionId: "TRANZLO_SESSION",
  authTimeout: 60,
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "en-US",
  logConsole: false,
  logQR: true, // Will print QR code directly in docker container logs
  popup: false,
  qrTimeout: 0,
  useChrome: false // Use Chromium bundled inside Alpine Docker
}).then((client) => {
  waClient = client;
  isReady = true;
  console.log("✅ WhatsApp Client is fully authenticated & connected!");
}).catch((err) => {
  console.error("❌ Failed to initialize WhatsApp client:", err);
});

// Middleware for authorization
function authorize(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  
  if (API_KEY && token !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized. Invalid API Key." });
  }
  next();
}

// HTTP endpoint matching Appwrite Function's payload structure
app.post("/send", authorize, async (req, res) => {
  if (!isReady || !waClient) {
    return res.status(503).json({ error: "WhatsApp Gateway is not authenticated yet. Scan QR code." });
  }

  const { to, content } = req.body;

  if (!to || !content) {
    return res.status(400).json({ error: "Missing 'to' or 'content' in request body." });
  }

  try {
    // sendText accepts recipient '9665xxxxx@c.us' and content string
    await waClient.sendText(to, content);
    console.log(`✉️ Message successfully sent to: ${to}`);
    return res.json({ success: true, message: "Dispatched successfully." });
  } catch (err) {
    console.error(`❌ Failed to send message to ${to}:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Health check status
app.get("/status", (req, res) => {
  return res.json({
    gateway: "Tranzlo WhatsApp open-wa HTTP Gateway",
    connected: isReady,
    status: isReady ? "Authenticated" : "Awaiting QR Code Scan / Initializing"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`📡 HTTP Server running on port ${PORT}`);
});
