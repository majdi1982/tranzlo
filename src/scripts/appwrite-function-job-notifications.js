// Appwrite Function: Tranzlo 3-Channel Notification & Project Lifecycle Dispatcher
// Language: Node.js (v18+)
//
// Concurrently sends In-App notifications, SMTP Emails, and WhatsApp messages (via open-wa) 
// in response to database changes on Jobs and Applications.

const { Client, Databases } = require("node-appwrite");
const nodemailer = require("nodemailer");

// Dynamic Fee rates based on Translator plan tier
const PLAN_FEES = {
  free: 0.20,     // 20% Platform Fee
  pro: 0.10,      // 10% Platform Fee
  standard: 0.10, // 10% Platform Fee (legacy compatibility)
  plus: 0.05      // 5% Platform Fee
};

// -------------------------------------------------------------
// HELPERS
// -------------------------------------------------------------

// Send email using SMTP
async function sendEmail({ to, subject, html, log, error }) {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || "help@tranzlo.net";
  const pass = process.env.SMTP_PASSWORD || "Cdromlg@8442";
  const from = process.env.SMTP_FROM || "support@tranzlo.net";

  if (!user || !pass) {
    log("⚠️ SMTP configuration missing in environment variables. Email skipped.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // True for port 465 SSL, false for others
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({ from, to, subject, html });
    log(`   ✅ Email sent successfully to: ${to}`);
  } catch (err) {
    error(`   ❌ Failed to send SMTP email: ${err.message}`);
  }
}

// Send WhatsApp via open-wa Gateway
async function sendWhatsApp({ to, message, log, error }) {
  const url = process.env.OPEN_WA_API_URL || "http://187.124.179.33:2785/api/sessions/tranzlo/messages/send-text";
  const apiKey = process.env.OPEN_WA_API_KEY || "owa_k1_1a5d0207b454ff67bc2711564fc9073bee9730a83ee30351ae83148d57df991b";

  if (!url || !to) {
    log("⚠️ WhatsApp skipped (OPEN_WA_API_URL missing or no recipient phone).");
    return;
  }

  // Format recipient (e.g. +9665xxxx -> 9665xxxx@c.us)
  const cleanPhone = to.replace(/[^0-9]/g, "");
  const recipient = `${cleanPhone}@c.us`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey ? `Bearer ${apiKey}` : ""
      },
      body: JSON.stringify({
        chatId: recipient,
        text: message
      })
    });

    if (res.ok) {
      log(`   ✅ WhatsApp message successfully dispatched to: ${to}`);
    } else {
      error(`   ❌ open-wa HTTP error: ${res.status} - ${await res.text()}`);
    }
  } catch (err) {
    error(`   ❌ Failed to call open-wa API: ${err.message}`);
  }
}

// Create In-App Notification in DB
async function createInAppNotification({ db, databaseId, userId, title, body, log, error }) {
  try {
    const docId = `notif_${Math.random().toString(36).substring(2, 11)}`;
    await db.createDocument(databaseId, "notifications", docId, {
      userId,
      type: "system",
      title,
      body,
      read: false,
      createdAt: new Date().toISOString()
    });
    log(`   ✅ In-App notification created for user: ${userId}`);
  } catch (err) {
    error(`   ❌ Failed to write In-App notification: ${err.message}`);
  }
}

// -------------------------------------------------------------
// MAIN WEBHOOK HANDLER
// -------------------------------------------------------------
module.exports = async function (context) {
  const { req, res, log, error } = context;

  // Configuration
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

  if (!endpoint || !projectId || !apiKey) {
    error("❌ Missing required Appwrite variables.");
    return res.json({ success: false, error: "Missing config." }, 500);
  }

  // Identify the triggering database event
  const triggerEvent = req.headers["x-appwrite-event"] || "";
  log(`🔔 Intercepted Database Event: "${triggerEvent}"`);

  let doc = {};
  try {
    doc = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (err) {
    error("❌ Failed to parse event document body: " + err.message);
    return res.json({ success: false, error: "Invalid document payload" }, 400);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  // A. EVENT: PROPOSAL CREATED (databases.*.collections.applications.documents.create)
  if (triggerEvent.includes("collections.applications.documents.create")) {
    const { jobId, translatorId, bidAmount, coverLetter } = doc;
    log(`📩 New Application ${doc.$id} on Job ${jobId} from Translator ${translatorId}`);

    try {
      // 1. Fetch Job and Employer/Company profile
      const job = await db.getDocument(databaseId, "jobs", jobId);
      const companyId = job.companyId;

      const compDocs = await db.listDocuments(databaseId, "company_profiles", [
        Query.equal("userId", companyId),
        Query.limit(1)
      ]);

      if (compDocs.documents.length > 0) {
        const comp = compDocs.documents[0];
        const email = comp.email;
        const phone = comp.phone;
        const isWaEnabled = comp.whatsappNotificationEnabled !== false;

        const title = "New Job Proposal Received";
        const messageText = `Hi ${comp.companyName}! You received a new proposal for your job "${job.title}" with a bid of $${bidAmount}. Review it now!`;

        // Dispatch all three channels concurrently
        await Promise.all([
          createInAppNotification({ db, databaseId, userId: companyId, title, body: messageText, log, error }),
          sendEmail({
            to: email,
            subject: `New Application for: ${job.title}`,
            html: `<h3>New Proposal Received!</h3><p>${messageText}</p><p><b>Cover Letter:</b> ${coverLetter}</p>`,
            log,
            error
          }),
          isWaEnabled && phone ? sendWhatsApp({ to: phone, message: messageText, log, error }) : Promise.resolve()
        ]);
      }
    } catch (err) {
      error(`❌ Processing proposal create error: ${err.message}`);
    }
  }

  // B. EVENT: APPLICATION STATE UPDATED (databases.*.collections.applications.documents.update)
  if (triggerEvent.includes("collections.applications.documents.update")) {
    const { jobId, translatorId, status } = doc;
    log(`🔄 Application updated to status: "${status}"`);

    try {
      const job = await db.getDocument(databaseId, "jobs", jobId);
      const employerId = job.companyId;

      // 1. EVENT: PROPOSAL ACCEPTED / CONTRACT STARTED (status: "accepted")
      if (status === "accepted") {
        log(`🤝 Proposal accepted! Starting contract for Job: "${job.title}"`);
        
        // Fetch Translator details
        const transDocs = await db.listDocuments(databaseId, "translator_profiles", [
          Query.equal("userId", translatorId),
          Query.limit(1)
        ]);

        if (transDocs.documents.length > 0) {
          const trans = transDocs.documents[0];
          const email = trans.email;
          const phone = trans.phone;
          const isWaEnabled = trans.whatsappNotificationEnabled !== false;

          const title = "Proposal Accepted & Job Started!";
          const messageText = `Congratulations ${trans.fullName}! Your proposal for "${job.title}" has been accepted. You can start working on the project now!`;

          await Promise.all([
            createInAppNotification({ db, databaseId, userId: translatorId, title, body: messageText, log, error }),
            sendEmail({
              to: email,
              subject: `Job Proposal Accepted: ${job.title}`,
              html: `<h3>Congratulations!</h3><p>${messageText}</p><p>Visit your dashboard to view contract files and communicate with the client.</p>`,
              log,
              error
            }),
            isWaEnabled && phone ? sendWhatsApp({ to: phone, message: messageText, log, error }) : Promise.resolve()
          ]);
        }
      }

      // 2. EVENT: TRANSLATOR SUBMITTED WORK (status: "submitted")
      if (status === "submitted") {
        log(`📤 Translator ${translatorId} submitted files for Job "${job.title}"`);

        // Fetch Employer/Company details
        const compDocs = await db.listDocuments(databaseId, "company_profiles", [
          Query.equal("userId", employerId),
          Query.limit(1)
        ]);

        if (compDocs.documents.length > 0) {
          const comp = compDocs.documents[0];
          const email = comp.email;
          const phone = comp.phone;
          const isWaEnabled = comp.whatsappNotificationEnabled !== false;

          const title = "Translation Files Delivered!";
          const messageText = `Great news ${comp.companyName}! The translator has submitted the final files for "${job.title}". Please review them and approve delivery.`;

          await Promise.all([
            createInAppNotification({ db, databaseId, userId: employerId, title, body: messageText, log, error }),
            sendEmail({
              to: email,
              subject: `Files Delivered for Job: ${job.title}`,
              html: `<h3>Files Ready for Review!</h3><p>${messageText}</p><p>Please review and approve the delivery to initiate the escrow payout schedule.</p>`,
              log,
              error
            }),
            isWaEnabled && phone ? sendWhatsApp({ to: phone, message: messageText, log, error }) : Promise.resolve()
          ]);
        }
      }

      // 3. EVENT: EMPLOYER APPROVED DELIVERY -> INIT 30-DAY ESCROW HOLD
      // (This occurs when the Employer moves application status to "approved" or we intercept approval)
      if (status === "approved") {
        log(`🏆 Delivery Approved for Job "${job.title}"! Initiating 30-day payout hold period...`);

        // Update Job and Application escrow status to "approved" and calculate release date
        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + 30); // Held in escrow for 30 days
        const releaseAtStr = releaseDate.toISOString();

        await Promise.all([
          db.updateDocument(databaseId, "jobs", jobId, {
            escrowStatus: "approved",
            releaseAt: releaseAtStr,
            updatedAt: new Date().toISOString()
          }),
          db.updateDocument(databaseId, "applications", doc.$id, {
            escrowStatus: "approved",
            releaseAt: releaseAtStr,
            updatedAt: new Date().toISOString()
          })
        ]);

        log(`   ✅ Escrow release date set to: ${releaseAtStr}`);

        // Fetch Translator details to notify them about approved delivery & pending payout
        const transDocs = await db.listDocuments(databaseId, "translator_profiles", [
          Query.equal("userId", translatorId),
          Query.limit(1)
        ]);

        if (transDocs.documents.length > 0) {
          const trans = transDocs.documents[0];
          const email = trans.email;
          const phone = trans.phone;
          const isWaEnabled = trans.whatsappNotificationEnabled !== false;

          const title = "Delivery Approved! Payout Held in Escrow";
          const messageText = `Great news ${trans.fullName}! Your delivery for "${job.title}" was approved by the client. Payout is now held in secure Escrow and will be automatically credited to your balance in 30 days (on ${releaseDate.toLocaleDateString()}).`;

          await Promise.all([
            createInAppNotification({ db, databaseId, userId: translatorId, title, body: messageText, log, error }),
            sendEmail({
              to: email,
              subject: `Delivery Approved: ${job.title}`,
              html: `<h3>Outstanding Job!</h3><p>${messageText}</p>`,
              log,
              error
            }),
            isWaEnabled && phone ? sendWhatsApp({ to: phone, message: messageText, log, error }) : Promise.resolve(),
            
            // Add unreleased funds to Translator's escrowBalance profile
            db.updateDocument(databaseId, "translator_profiles", trans.$id, {
              escrowBalance: (trans.escrowBalance || 0) + (doc.bidAmount || job.budget),
              updatedAt: new Date().toISOString()
            })
          ]);
        }
      }
    } catch (err) {
      error(`❌ Processing application update event error: ${err.message}`);
    }
  }

  return res.json({ success: true, message: "Notifications processed successfully." });
};
