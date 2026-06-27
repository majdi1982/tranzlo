// Appwrite Function: Tranzlo 3-Channel Notification & Project Lifecycle Dispatcher
// Language: Node.js (v18+)
//
// Concurrently sends In-App notifications, SMTP Emails, and WhatsApp messages (via open-wa) 
// in response to database changes on Jobs and Applications.

const { Client, Databases, Query } = require("node-appwrite");
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

// Create In-App Notification in DB (Only creates database doc; the DB Event will send Email/WhatsApp)
async function createInAppNotification({ db, databaseId, userId, type, title, body, data, log, error }) {
  try {
    const docId = `notif_${Math.random().toString(36).substring(2, 11)}`;
    await db.createDocument(databaseId, "notifications", docId, {
      userId,
      type: type || "system",
      title,
      body,
      data: data ? JSON.stringify(data) : null,
      read: false,
      createdAt: new Date().toISOString()
    });
    log(`   ✅ In-App notification created in database for user: ${userId} (${type || "system"})`);
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

  // ---------------------------------------------------------------------------
  // 1. EVENT: IN-APP NOTIFICATION DOCUMENT CREATION
  // ---------------------------------------------------------------------------
  if (triggerEvent.includes("collections.notifications.documents.create")) {
    const { userId, type, title, body, data } = doc;
    log(`🔔 Intercepted notification doc creation for user: ${userId}, type: ${type}`);

    try {
      let emailEnabled = true;
      let inAppEnabled = true;

      if (data) {
        try {
          const parsedData = typeof data === "string" ? JSON.parse(data) : data;
          if (parsedData.emailEnabled === false) emailEnabled = false;
          if (parsedData.inAppEnabled === false) inAppEnabled = false;
        } catch (e) {
          log("⚠️ Error parsing notification data payload: " + e.message);
        }
      }

      let userEmail = "";
      let userName = "User";
      let userPhone = "";
      let isWaEnabled = true;

      // Check translators first
      const transDocs = await db.listDocuments(databaseId, "translator_profiles", [
        Query.equal("userId", userId),
        Query.limit(1)
      ]);

      if (transDocs.documents.length > 0) {
        const trans = transDocs.documents[0];
        userEmail = trans.email || trans.emailAddress;
        userName = trans.fullName || "Translator";
        userPhone = trans.phone;
        isWaEnabled = trans.whatsappNotificationEnabled !== false;
      } else {
        // Check companies
        const compDocs = await db.listDocuments(databaseId, "company_profiles", [
          Query.equal("userId", userId),
          Query.limit(1)
        ]);
        if (compDocs.documents.length > 0) {
          const comp = compDocs.documents[0];
          userEmail = comp.email || comp.emailAddress;
          userName = comp.companyName || "Company";
          userPhone = comp.phone;
          isWaEnabled = comp.whatsappNotificationEnabled !== false;
        }
      }

      if (userEmail && emailEnabled) {
        // Styled HTML email theme mapping
        let primaryColor = "#4f46e5"; // default Indigo
        let typeLabel = "System Notification";
        
        if (type === "welcome" || type === "verification_approved" || type === "hub_post_approved" || type === "blog_post_approved") {
          primaryColor = "#10b981"; // Success Green
          typeLabel = "Account Update";
        } else if (type === "verification_rejected" || type === "upgrade_required" || type === "trial_ending" || type === "complaint_update" || type === "dispute_update") {
          primaryColor = "#f59e0b"; // Warning Amber
          typeLabel = "Alert / Action Required";
        } else if (type === "subscription_expired") {
          primaryColor = "#ef4444"; // Danger Red
          typeLabel = "Subscription Status";
        } else if (type === "subscription_updated") {
          primaryColor = "#06b6d4"; // Cyan Info
          typeLabel = "Billing & Subscription";
        }

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f3f4f6;
                color: #1f2937;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
              }
              .header {
                background-color: ${primaryColor};
                color: #ffffff;
                padding: 30px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              }
              .badge {
                display: inline-block;
                background-color: rgba(255, 255, 255, 0.25);
                color: #ffffff;
                font-size: 11px;
                font-weight: 600;
                padding: 4px 12px;
                border-radius: 9999px;
                margin-top: 10px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .content {
                padding: 30px 25px;
                line-height: 1.6;
              }
              .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
              }
              .message {
                font-size: 15px;
                margin-bottom: 25px;
                color: #4b5563;
              }
              .cta-container {
                text-align: center;
                margin-bottom: 25px;
              }
              .cta-button {
                display: inline-block;
                background-color: ${primaryColor};
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
              }
              .footer {
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                border-top: 1px solid #f3f4f6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Tranzlo</h1>
                <span class="badge">${typeLabel}</span>
              </div>
              <div class="content">
                <div class="greeting">Hello ${userName},</div>
                <div class="message">
                  <p><strong>${title}</strong></p>
                  <p>${body}</p>
                </div>
                <div class="cta-container">
                  <a href="https://tranzlo.net/dashboard" class="cta-button">Go to Dashboard</a>
                </div>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Tranzlo. All rights reserved.</p>
                <p>You received this email because you are registered on Tranzlo. If you wish to manage your email notification settings, please update your account settings.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await Promise.all([
          sendEmail({
            to: userEmail,
            subject: `Tranzlo: ${title}`,
            html: htmlContent,
            log,
            error
          }),
          isWaEnabled && userPhone ? sendWhatsApp({ to: userPhone, message: `${title}\n\n${body}`, log, error }) : Promise.resolve()
        ]);
      }

      // Cleanup document if inAppEnabled is false
      if (!inAppEnabled) {
        log(`🗑️ In-app notification disabled. Deleting document: ${doc.$id}`);
        await db.deleteDocument(databaseId, "notifications", doc.$id);
      }

    } catch (err) {
      error(`❌ Processing notification db event error: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. EVENT: PROPOSAL CREATED (databases.*.collections.applications.documents.create)
  // ---------------------------------------------------------------------------
  if (triggerEvent.includes("collections.applications.documents.create")) {
    const { jobId, translatorId, bidAmount, coverLetter } = doc;
    log(`📩 New Application ${doc.$id} on Job ${jobId} from Translator ${translatorId}`);

    try {
      const job = await db.getDocument(databaseId, "jobs", jobId);
      const companyId = job.companyId;

      const compDocs = await db.listDocuments(databaseId, "company_profiles", [
        Query.equal("userId", companyId),
        Query.limit(1)
      ]);

      if (compDocs.documents.length > 0) {
        const comp = compDocs.documents[0];
        const title = "New Job Proposal Received";
        const messageText = `Hi ${comp.companyName}! You received a new proposal for your job "${job.title}" with a bid of $${bidAmount}. Review it now!`;

        // We only write to database notification; the database event will send Email/WhatsApp
        await createInAppNotification({
          db,
          databaseId,
          userId: companyId,
          type: "application_update",
          title,
          body: messageText,
          log,
          error
        });
      }
    } catch (err) {
      error(`❌ Processing proposal create error: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. EVENT: APPLICATION STATE UPDATED (databases.*.collections.applications.documents.update)
  // ---------------------------------------------------------------------------
  if (triggerEvent.includes("collections.applications.documents.update")) {
    const { jobId, translatorId, status } = doc;
    log(`🔄 Application updated to status: "${status}"`);

    try {
      const job = await db.getDocument(databaseId, "jobs", jobId);
      const employerId = job.companyId;

      // A. EVENT: PROPOSAL ACCEPTED / CONTRACT STARTED (status: "accepted")
      if (status === "accepted") {
        log(`🤝 Proposal accepted! Starting contract for Job: "${job.title}"`);
        
        const transDocs = await db.listDocuments(databaseId, "translator_profiles", [
          Query.equal("userId", translatorId),
          Query.limit(1)
        ]);

        if (transDocs.documents.length > 0) {
          const trans = transDocs.documents[0];
          const title = "Proposal Accepted & Job Started!";
          const messageText = `Congratulations ${trans.fullName}! Your proposal for "${job.title}" has been accepted. You can start working on the project now!`;

          await createInAppNotification({
            db,
            databaseId,
            userId: translatorId,
            type: "application_update",
            title,
            body: messageText,
            log,
            error
          });
        }
      }

      // B. EVENT: TRANSLATOR SUBMITTED WORK (status: "submitted")
      if (status === "submitted") {
        log(`📤 Translator ${translatorId} submitted files for Job "${job.title}"`);

        const compDocs = await db.listDocuments(databaseId, "company_profiles", [
          Query.equal("userId", employerId),
          Query.limit(1)
        ]);

        if (compDocs.documents.length > 0) {
          const comp = compDocs.documents[0];
          const title = "Translation Files Delivered!";
          const messageText = `Great news ${comp.companyName}! The translator has submitted the final files for "${job.title}". Please review them and approve delivery.`;

          await createInAppNotification({
            db,
            databaseId,
            userId: employerId,
            type: "application_update",
            title,
            body: messageText,
            log,
            error
          });
        }
      }

      // C. EVENT: EMPLOYER APPROVED DELIVERY -> INIT 30-DAY ESCROW HOLD
      if (status === "approved") {
        log(`🏆 Delivery Approved for Job "${job.title}"! Initiating 30-day payout hold period...`);

        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + 30);
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

        const transDocs = await db.listDocuments(databaseId, "translator_profiles", [
          Query.equal("userId", translatorId),
          Query.limit(1)
        ]);

        if (transDocs.documents.length > 0) {
          const trans = transDocs.documents[0];
          const title = "Delivery Approved! Payout Held in Escrow";
          const messageText = `Great news ${trans.fullName}! Your delivery for "${job.title}" was approved by the client. Payout is now held in secure Escrow and will be automatically credited to your balance in 30 days (on ${releaseDate.toLocaleDateString()}).`;

          await Promise.all([
            createInAppNotification({
              db,
              databaseId,
              userId: translatorId,
              type: "application_update",
              title,
              body: messageText,
              log,
              error
            }),
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

  // ---------------------------------------------------------------------------
  // 4. EVENT: JOB CREATED (databases.*.collections.jobs.documents.create)
  // ---------------------------------------------------------------------------
  if (triggerEvent.includes("collections.jobs.documents.create")) {
    const { title: jobTitle, sourceLanguage, targetLanguage, budget, externalTranslatorEmail } = doc;
    log(`💼 New Job Created: "${jobTitle}" (${sourceLanguage} ➔ ${targetLanguage})`);

    try {
      // 1. External Translator Email Invitation
      if (externalTranslatorEmail) {
        log(`   📧 Found external translator email: ${externalTranslatorEmail}. Sending invitation...`);
        const inviteHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Inter', sans-serif; background-color: #f3f4f6; color: #1f2937; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; }
              h2 { color: #4f46e5; margin-bottom: 20px; }
              p { font-size: 16px; line-height: 1.5; color: #4b5563; }
              .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>You've been invited to a translation job!</h2>
              <p>A client on Tranzlo has specifically requested you for their upcoming project: <strong>${jobTitle}</strong>.</p>
              <p>Project Budget: $${budget}</p>
              <p>Please sign up or log in to Tranzlo to review the full requirements and accept the job.</p>
              <a href="https://tranzlo.net/signup?role=translator" class="btn">View Job on Tranzlo</a>
            </div>
          </body>
          </html>
        `;
        await sendEmail({
          to: externalTranslatorEmail,
          subject: `Tranzlo: Invitation to Translation Job "${jobTitle}"`,
          html: inviteHtml,
          log,
          error
        });
      }
      const transDocs = await db.listDocuments(databaseId, "translator_profiles", [
        Query.limit(100)
      ]);

      log(`   🔍 Checking ${transDocs.documents.length} translator profiles for language pair match...`);

      for (const trans of transDocs.documents) {
        let isMatch = false;

        if (trans.languagePairs) {
          try {
            const pairs = typeof trans.languagePairs === "string" 
              ? JSON.parse(trans.languagePairs) 
              : trans.languagePairs;

            if (Array.isArray(pairs)) {
              isMatch = pairs.some(
                (p) => 
                  p.source.toLowerCase() === sourceLanguage.toLowerCase() && 
                  p.target.toLowerCase() === targetLanguage.toLowerCase()
              );
            }
          } catch (e) {
            log(`   ⚠️ Failed to parse languagePairs for translator: ${trans.fullName}. Error: ${e.message}`);
          }
        }

        if (isMatch) {
          log(`   🎯 Match found! Notifying translator: ${trans.fullName} (${trans.userId})`);
          
          const title = `New Job Match: ${jobTitle}`;
          const body = `A new job matches your language pair (${sourceLanguage} ➔ ${targetLanguage}) with a budget of $${budget}. Check it out!`;

          await createInAppNotification({
            db,
            databaseId,
            userId: trans.userId,
            type: "job_match",
            title,
            body,
            log,
            error
          });
        }
      }
    } catch (err) {
      error(`❌ Processing job creation error: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. EVENT: NEW MESSAGE CREATED (databases.*.collections.messages.documents.create)
  // ---------------------------------------------------------------------------
  if (triggerEvent.includes("collections.messages.documents.create")) {
    const { conversationId, senderId, content: msgContent } = doc;
    log(`💬 New Message in conversation ${conversationId} from ${senderId}`);

    try {
      const conv = await db.getDocument(databaseId, "conversations", conversationId);
      const recipientId = conv.participants.find(id => id !== senderId);

      if (recipientId) {
        // Find sender name
        let senderName = "Someone";
        const [transDocs, compDocs] = await Promise.all([
          db.listDocuments(databaseId, "translator_profiles", [Query.equal("userId", senderId), Query.limit(1)]),
          db.listDocuments(databaseId, "company_profiles", [Query.equal("userId", senderId), Query.limit(1)])
        ]);

        if (transDocs.documents.length > 0) senderName = transDocs.documents[0].fullName;
        else if (compDocs.documents.length > 0) senderName = compDocs.documents[0].companyName;

        const title = `New Message from ${senderName}`;
        const body = msgContent.length > 100 ? msgContent.substring(0, 100) + '...' : msgContent;

        await createInAppNotification({
          db,
          databaseId,
          userId: recipientId,
          type: "new_message",
          title,
          body,
          log,
          error,
          data: { emailEnabled: false } // Disable immediate email
        });
      }
    } catch (err) {
      error(`❌ Processing new message error: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. EVENT: NEW TRANSLATOR REGISTERED (databases.*.collections.translator_profiles.documents.create)
  // ---------------------------------------------------------------------------
  if (triggerEvent.includes("collections.translator_profiles.documents.create")) {
    log(`🎉 New Translator Registered: ${doc.fullName} (${doc.userId})`);
    try {
      await createInAppNotification({
        db,
        databaseId,
        userId: doc.userId,
        type: "welcome",
        title: "Welcome to Tranzlo! 🚀",
        body: "We are thrilled to have you! Complete your profile, take the verification test, and start applying for jobs to grow your freelance business.",
        log,
        error
      });
    } catch (err) {
      error(`❌ Processing translator welcome error: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. EVENT: NEW COMPANY REGISTERED (databases.*.collections.company_profiles.documents.create)
  // ---------------------------------------------------------------------------
  if (triggerEvent.includes("collections.company_profiles.documents.create")) {
    log(`🎉 New Company Registered: ${doc.companyName} (${doc.userId})`);
    try {
      await createInAppNotification({
        db,
        databaseId,
        userId: doc.userId,
        type: "welcome",
        title: "Welcome to Tranzlo! 🏢",
        body: "Post your first translation job, invite top-rated translators, and manage your projects effortlessly.",
        log,
        error
      });
    } catch (err) {
      error(`❌ Processing company welcome error: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 8. EVENT: ADMIN NOTIFICATIONS (Disputes, Complaints, Verifications)
  // ---------------------------------------------------------------------------
  if (
    triggerEvent.includes("collections.disputes.documents.create") ||
    triggerEvent.includes("collections.complaints.documents.create") ||
    triggerEvent.includes("collections.verifications.documents.create")
  ) {
    let typeName = "Alert";
    if (triggerEvent.includes("disputes")) typeName = "Dispute";
    if (triggerEvent.includes("complaints")) typeName = "Complaint";
    if (triggerEvent.includes("verifications")) typeName = "Verification Request";
    
    log(`🚨 Admin Alert: New ${typeName} created (${doc.$id})`);
    
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@tranzlo.net";
      const inviteHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #f3f4f6; color: #1f2937; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; }
            h2 { color: #ef4444; margin-bottom: 20px; }
            p { font-size: 16px; line-height: 1.5; color: #4b5563; }
            .btn { display: inline-block; background-color: #ef4444; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Admin Action Required: New ${typeName}</h2>
            <p>A new <strong>${typeName}</strong> has been submitted on the platform and requires your review.</p>
            <p>Document ID: ${doc.$id}</p>
            <a href="https://tranzlo.net/dashboard/admin" class="btn">Go to Admin Dashboard</a>
          </div>
        </body>
        </html>
      `;
      await sendEmail({
        to: adminEmail,
        subject: `Tranzlo Admin: New ${typeName} Requires Attention`,
        html: inviteHtml,
        log,
        error
      });
    } catch (err) {
      error(`❌ Processing admin alert error: ${err.message}`);
    }
  }

  return res.json({ success: true, message: "Notifications processed successfully." });
};

