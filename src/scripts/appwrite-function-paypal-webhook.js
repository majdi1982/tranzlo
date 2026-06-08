// Appwrite Function: PayPal Webhooks Billing & Escrow Handler
// Language: Node.js (v18+)
//
// Receives PayPal Webhook alerts, processes subscriptions, and updates user plans and job escrow statuses in Appwrite DB.

const { Client, Databases, Query } = require("node-appwrite");

// Map PayPal Plan IDs to Tranzlo Plan Tiers ("pro", "plus") and Roles ("translator", "company")
const PLAN_MAP = {
  // Translator Plans
  "P-6BH643160R158860TNIQF2KQ": { tier: "pro", role: "translator" }, // Monthly Pro ($18)
  "P-34E03651943893946NIQFS3Y": { tier: "pro", role: "translator" }, // Annual Pro ($120)
  "P-6W050275X4975753MNIQFZPQ": { tier: "plus", role: "translator" },     // Monthly Plus ($25)
  "P-8R773786AM2534425NIQFULQ": { tier: "plus", role: "translator" },     // Annual Plus ($200)

  // Company Plans (Annual Only)
  "P-8JB63458CY1027604NIQF5FQ": { tier: "pro", role: "company" },    // Annual Pro ($200)
  "P-30J14765A4566030ANIQFWDA": { tier: "plus", role: "company" }         // Annual Plus ($300)
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

    // Extract userId and optional promoCode passed in the PayPal custom_id or subscriber custom_field (formatted as userId:promoCode)
    const customId = resource.custom_id || (resource.subscriber && resource.subscriber.custom_id) || "";
    let userId = customId;
    let promoCode = "";
    if (customId.includes(":")) {
      const parts = customId.split(":");
      userId = parts[0];
      promoCode = parts[1];
    }

    log(`💎 Processing subscription ${subscriptionId} for plan ${planId} (User: ${userId}, Promo: ${promoCode})`);

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
      const updatePayload = {
        planTier: mapping.tier,
        paypalSubscriptionId: subscriptionId,
        updatedAt: new Date().toISOString()
      };
      if (promoCode) {
        updatePayload.promoCodeUsed = promoCode;
        try {
          const promoDocs = await db.listDocuments(databaseId, "promo_codes", [
            Query.equal("code", promoCode),
            Query.limit(1)
          ]);
          if (promoDocs.documents.length > 0) {
            const promo = promoDocs.documents[0];
            await db.updateDocument(databaseId, "promo_codes", promo.$id, {
              usedCount: (promo.usedCount || 0) + 1
            });
            log(`   ✅ Incremented usage count for promo code ${promoCode}`);
          }
        } catch (promoErr) {
          error(`❌ Failed to increment promo code usage: ${promoErr.message}`);
        }
      }
      await db.updateDocument(databaseId, collection, profile.$id, updatePayload);

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
    const senderItemId = payoutItem.sender_item_id; // Unique ID like payout_... or payout_salary_...
    const amountVal = parseFloat(payoutItem.amount ? payoutItem.amount.value : "0");

    log(`💸 Processing Payout Item Webhook: ID ${payoutItemId} | Status: ${transactionStatus} | Sender Item ID: ${senderItemId}`);

    if (!senderItemId) {
      log("ℹ️ Payout event has no sender_item_id. Skipped.");
      return res.json({ success: true, message: "Non-matching payout event skipped." });
    }

    try {
      const now = new Date().toISOString();
      const newTransferStatus = (transactionStatus === "SUCCESS" || eventType === "PAYMENT.PAYOUTS-ITEM.SUCCEEDED")
        ? "succeeded"
        : "failed";

      log(`   🔄 Auto-updating database records for Payout ${senderItemId} to status: ${newTransferStatus}...`);

      // 1. Update matching transaction in transactions_ledger
      try {
        const txDocs = await db.listDocuments(databaseId, "transactions_ledger", [
          Query.equal("transactionId", senderItemId),
          Query.limit(1)
        ]);

        if (txDocs.documents.length > 0) {
          const txDoc = txDocs.documents[0];
          await db.updateDocument(databaseId, "transactions_ledger", txDoc.$id, {
            transferStatus: newTransferStatus,
            status: newTransferStatus === "succeeded" ? "released" : "failed",
            responseLog: JSON.stringify(resource).slice(0, 4000),
            createdAt: now
          });
          log(`      ✅ Updated transactions_ledger record ${txDoc.$id}`);

          // 2. If it is a salary payment, update the matching employee's record
          if (txDoc.code && txDoc.code.startsWith("salary_")) {
            const empId = txDoc.code.replace("salary_", "");
            const empDocs = await db.listDocuments(databaseId, "employee_salaries", [
              Query.equal("employeeId", empId),
              Query.limit(1)
            ]);

            if (empDocs.documents.length > 0) {
              const empDoc = empDocs.documents[0];
              await db.updateDocument(databaseId, "employee_salaries", empDoc.$id, {
                transferStatus: newTransferStatus,
                paymentStatus: newTransferStatus === "succeeded" ? "paid" : "failed",
                lastPayoutDate: now
              });
              log(`      ✅ Updated employee_salaries record ${empDoc.$id} for employee ${empId}`);
            }
          }
        }
      } catch (txErr) {
        error(`   ❌ Failed to update transaction logs: ${txErr.message}`);
      }

      // 3. Keep fallback logic for translator escrow job payout updates
      if (senderItemId.startsWith("job_") || !senderItemId.includes("_")) {
        const jobId = senderItemId;
        if (newTransferStatus === "succeeded") {
          await db.updateDocument(databaseId, "jobs", jobId, {
            escrowStatus: "released",
            updatedAt: now
          });
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
        } else {
          await db.updateDocument(databaseId, "jobs", jobId, {
            escrowStatus: "approved", 
            updatedAt: now
          });
        }
      }

      return res.json({ success: true, message: `Payout status updated to ${newTransferStatus}` });
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
