// Appwrite Function: Message Reminder (Cron)
// Language: Node.js (v18+)
// CRON: 0 * * * * (Every hour)
//
// Checks for messages older than 6 hours that are still unread (read === false)
// and haven't had a reminder sent yet (reminderSent !== true).

const { Client, Databases, Query } = require("node-appwrite");
const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, html, log, error }) {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || "help@tranzlo.net";
  const pass = process.env.SMTP_PASSWORD || "Cdromlg@8442";
  const from = process.env.SMTP_FROM || "support@tranzlo.net";

  if (!user || !pass) {
    log("⚠️ SMTP configuration missing. Email skipped.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({ from, to, subject, html });
    log(`   ✅ Reminder email sent successfully to: ${to}`);
  } catch (err) {
    error(`   ❌ Failed to send SMTP email: ${err.message}`);
  }
}

module.exports = async function (context) {
  const { req, res, log, error } = context;

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

  if (!endpoint || !projectId || !apiKey) {
    error("❌ Missing required Appwrite variables.");
    return res.json({ success: false, error: "Missing config." }, 500);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  try {
    log("🔍 Checking for unread messages older than 6 hours...");
    
    // Calculate 6 hours ago
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    const timeThreshold = sixHoursAgo.toISOString();

    const result = await db.listDocuments(databaseId, "messages", [
      Query.equal("read", false),
      Query.lessThanEqual("createdAt", timeThreshold),
      Query.notEqual("reminderSent", true), // We will add this boolean attribute to messages collection
      Query.limit(50) // Process in batches
    ]);

    log(`Found ${result.documents.length} unread messages needing reminders.`);

    for (const msg of result.documents) {
      log(`Processing message ${msg.$id} from conversation ${msg.conversationId}...`);
      
      const conv = await db.getDocument(databaseId, "conversations", msg.conversationId);
      const recipientId = conv.participants.find(id => id !== msg.senderId);

      if (recipientId) {
        // Find recipient email & sender name
        let recipientEmail = "";
        let senderName = "Someone";

        const [transDocs, compDocs] = await Promise.all([
          db.listDocuments(databaseId, "translator_profiles", [Query.equal("userId", recipientId), Query.limit(1)]),
          db.listDocuments(databaseId, "company_profiles", [Query.equal("userId", recipientId), Query.limit(1)])
        ]);

        if (transDocs.documents.length > 0) recipientEmail = transDocs.documents[0].email || transDocs.documents[0].emailAddress;
        else if (compDocs.documents.length > 0) recipientEmail = compDocs.documents[0].email || compDocs.documents[0].emailAddress;

        const [senderTransDocs, senderCompDocs] = await Promise.all([
          db.listDocuments(databaseId, "translator_profiles", [Query.equal("userId", msg.senderId), Query.limit(1)]),
          db.listDocuments(databaseId, "company_profiles", [Query.equal("userId", msg.senderId), Query.limit(1)])
        ]);

        if (senderTransDocs.documents.length > 0) senderName = senderTransDocs.documents[0].fullName;
        else if (senderCompDocs.documents.length > 0) senderName = senderCompDocs.documents[0].companyName;

        if (recipientEmail) {
          const title = `You have an unread message from ${senderName}`;
          const body = msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
          
          const inviteHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Inter', sans-serif; background-color: #f3f4f6; color: #1f2937; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; }
                h2 { color: #4f46e5; margin-bottom: 20px; }
                p { font-size: 16px; line-height: 1.5; color: #4b5563; }
                .msg-box { background-color: #f9fafb; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0; text-align: left; font-style: italic; }
                .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>New Message Reminder</h2>
                <p>Hello,</p>
                <p>You received a message on Tranzlo 6 hours ago from <strong>${senderName}</strong> that you haven't read yet.</p>
                <div class="msg-box">"${body}"</div>
                <a href="https://tranzlo.net/messages" class="btn">View and Reply</a>
              </div>
            </body>
            </html>
          `;

          await sendEmail({
            to: recipientEmail,
            subject: `Tranzlo: Unread Message from ${senderName}`,
            html: inviteHtml,
            log,
            error
          });
        }
      }

      // Mark message as reminded to prevent duplicate emails
      await db.updateDocument(databaseId, "messages", msg.$id, {
        reminderSent: true
      });
      log(`   ✅ Message ${msg.$id} marked as reminderSent=true`);
    }

    return res.json({ success: true, processed: result.documents.length });
  } catch (err) {
    error(`❌ Reminder function error: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
