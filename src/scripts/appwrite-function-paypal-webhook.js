// Appwrite Function: PayPal Webhooks Billing & Escrow Handler
// Language: Node.js (v18+)
//
// Receives PayPal Webhook alerts, processes subscriptions, and updates user plans and job escrow statuses in Appwrite DB.

const { Client, Databases, Query } = require("node-appwrite");

// Map PayPal Plan IDs to Tranzlo Plan Tiers ("standard", "plus") and Roles ("translator", "company")
const PLAN_MAP = {
  // Translator Plans
  "P-67S23580XX424023HNHN3PVA": { tier: "standard", role: "translator" }, // Annual
  "P-1FA07072XD6828721NHNGB6I": { tier: "standard", role: "translator" }, // Monthly
  "P-2YT069538P2060108NHN3OZA": { tier: "plus", role: "translator" },     // Annual
  "P-5H654170A9572811WNHNGK3Q": { tier: "plus", role: "translator" },     // Monthly

  // Company Plans (Professional)
  "P-69A23890DT383361KNHN26ZQ": { tier: "standard", role: "company" },    // Monthly
  "P-9DV15255E68299003NHN3OFI": { tier: "standard", role: "company" },    // Annual
  "P-7R9234853W7319009NHN3A2I": { tier: "plus", role: "company" },        // Monthly
  "P-2WR17344M29329341NHN3NPI": { tier: "plus", role: "company" }         // Annual
};

module.exports = async function (context) {
  const { req, res, log, error } = context;

  // Initialize Appwrite client
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

  if (!endpoint || !projectId || !apiKey) {
    error("❌ Missing Appwrite environment credentials.");
    return res.json({ success: false, error: "Configuration missing." }, 500);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  // Parse webhook payload
  let payload = {};
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (parseErr) {
    error("❌ Failed to parse payload: " + parseErr.message);
    return res.json({ success: false, error: "Invalid JSON body" }, 400);
  }

  const eventType = payload.event_type;
  const resource = payload.resource;

  log(`🔔 Received PayPal Webhook Event: ${eventType} (ID: ${payload.id})`);

  // 1. HANDLE MEMBERSHIP SUBSCRIPTIONS
  if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType === "BILLING.SUBSCRIPTION.CREATED") {
    const subscriptionId = resource.id;
    const planId = resource.plan_id;

    // Extract userId passed in the PayPal custom_id or subscriber custom_field
    const userId = resource.custom_id || (resource.subscriber && resource.subscriber.custom_id);

    log(`💎 Processing subscription ${subscriptionId} for plan ${planId} (User: ${userId})`);

    if (!userId) {
      error("❌ Webhook missing custom_id / userId in metadata.");
      return res.json({ success: false, error: "Missing custom_id metadata matching user." }, 400);
    }

    const mapping = PLAN_MAP[planId];
    if (!mapping) {
      error(`❌ Unknown PayPal Plan ID: ${planId}`);
      return res.json({ success: false, error: "Unknown plan configuration." }, 400);
    }

    const collection = mapping.role === "translator" ? "translator_profiles" : "company_profiles";
    log(`💾 Upgrading ${mapping.role} profile (User: ${userId}) to tier ${mapping.tier}...`);

    try {
      // Find matching profile by userId
      const docs = await db.listDocuments(databaseId, collection, [
        Query.equal("userId", userId),
        Query.limit(1)
      ]);

      if (docs.documents.length === 0) {
        error(`❌ Profile not found for userId: ${userId}`);
        return res.json({ success: false, error: "Profile not found" }, 404);
      }

      const profile = docs.documents[0];
      await db.updateDocument(databaseId, collection, profile.$id, {
        planTier: mapping.tier,
        paypalSubscriptionId: subscriptionId,
        updatedAt: new Date().toISOString()
      });

      log(`   ✅ SUCCESS: Profile upgraded successfully!`);
      return res.json({ success: true, message: `Upgraded to ${mapping.tier}` });
    } catch (dbErr) {
      error("❌ DB upgrade execution failed: " + dbErr.message);
      return res.json({ success: false, error: dbErr.message }, 500);
    }
  }

  // 2. HANDLE JOB ESCROW PAYMENTS (PAYPAL CAPTURE)
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const captureId = resource.id;
    const amount = parseFloat(resource.amount.value);

    // Custom field containing "jobId:applicationId"
    const customMetadata = resource.custom_id || "";
    const [jobId, applicationId] = customMetadata.split(":");

    log(`💳 Processing payment capture ${captureId} of $${amount} (Job: ${jobId}, Application: ${applicationId})`);

    if (!jobId) {
      log("ℹ️ Capture complete but no custom_id with jobId found. Likely direct or unrelated payment.");
      return res.json({ success: true, message: "Non-escrow capture skipped." });
    }

    try {
      // 1. Update the funded job details
      const jobDoc = await db.getDocument(databaseId, "jobs", jobId);
      if (jobDoc) {
        await db.updateDocument(databaseId, "jobs", jobId, {
          escrowStatus: "funded",
          escrowAmount: amount,
          paypalCaptureId: captureId,
          updatedAt: new Date().toISOString()
        });
        log(`   ✅ Job ${jobId} escrow set to funded.`);
      }

      // 2. If applicationId is present, update the application status as well
      if (applicationId) {
        const appDoc = await db.getDocument(databaseId, "applications", applicationId);
        if (appDoc) {
          await db.updateDocument(databaseId, "applications", applicationId, {
            escrowStatus: "funded",
            escrowAmount: amount,
            paypalCaptureId: captureId,
            updatedAt: new Date().toISOString()
          });
          log(`   ✅ Application ${applicationId} escrow set to funded.`);
        }
      }

      log(`   ✅ SUCCESS: Escrow balances updated on Appwrite database!`);
      return res.json({ success: true, message: "Escrow balances funded successfully." });
    } catch (err) {
      error("❌ Database updates failed for escrow funding: " + err.message);
      return res.json({ success: false, error: err.message }, 500);
    }
  }

  // 3. HANDLE PAYPAL PAYOUT EVENTS (Payout Succeeded or Failed)
  if (
    eventType === "PAYMENT.PAYOUTS-ITEM.SUCCEEDED" ||
    eventType === "PAYMENT.PAYOUTS-ITEM.FAILED" ||
    eventType === "PAYMENT.PAYOUTS-ITEM.DENIED" ||
    eventType === "PAYMENT.PAYOUTS-ITEM.BLOCKED" ||
    eventType === "PAYMENT.PAYOUTS-ITEM.CANCELED"
  ) {
    const payoutItemId = resource.payout_item_id;
    const transactionStatus = resource.transaction_status;
    const payoutItem = resource.payout_item || {};
    const jobId = payoutItem.sender_item_id; // Matches the jobId passed during payout initiation

    log(`💸 Processing Payout Item Webhook: ID ${payoutItemId} | Status: ${transactionStatus} | Job ID: ${jobId}`);

    if (!jobId) {
      log("ℹ️ Payout event has no sender_item_id matching jobId. Skipped.");
      return res.json({ success: true, message: "Non-matching payout event skipped." });
    }

    try {
      const now = new Date().toISOString();
      if (transactionStatus === "SUCCESS" || eventType === "PAYMENT.PAYOUTS-ITEM.SUCCEEDED") {
        // Payout successfully completed on PayPal side!
        log(`   ✅ Payout succeeded on PayPal for Job ${jobId}. Updating job status...`);
        
        await db.updateDocument(databaseId, "jobs", jobId, {
          escrowStatus: "released",
          updatedAt: now
        });

        // Also update matching application
        try {
          const apps = await db.listDocuments(databaseId, "applications", [
            Query.equal("jobId", jobId),
            Query.limit(1)
          ]);
          if (apps.documents.length > 0) {
            await db.updateDocument(databaseId, "applications", apps.documents[0].$id, {
              escrowStatus: "released",
              updatedAt: now
            });
          }
        } catch (appErr) {
          log(`   ⚠️ Could not update application payout status: ${appErr.message}`);
        }

        log(`   ✅ Job ${jobId} escrowStatus successfully marked as released.`);
      } else {
        // Payout failed/denied on PayPal side!
        log(`   ❌ Payout failed/denied on PayPal for Job ${jobId}. Reverting or logging failure...`);
        
        // Mark job as approved (so it can be reviewed and retried) instead of released
        await db.updateDocument(databaseId, "jobs", jobId, {
          escrowStatus: "approved", 
          updatedAt: now
        });
      }

      return res.json({ success: true, message: `Payout status updated to ${transactionStatus}` });
    } catch (err) {
      error("❌ Database updates failed for payout status: " + err.message);
      return res.json({ success: false, error: err.message }, 500);
    }
  }

  // Payout Batch alerts
  if (eventType?.startsWith("PAYMENT.PAYOUTSBATCH.") || eventType === "PAYMENTS.CUSTOMER-PAYOUTS.CREATED") {
    log(`ℹ️ Generic Payout Batch update received: ${eventType}`);
    return res.json({ success: true, message: "Payout batch update logged successfully." });
  }

  // Skipped events
  log(`⏭️ Event skipped (not handled).`);
  return res.json({ success: true, message: "Skipped unhandled event." });
};
