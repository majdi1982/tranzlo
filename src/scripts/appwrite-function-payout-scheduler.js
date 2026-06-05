// Appwrite Function: 30-Day Escrow Payout Scheduler with PayPal Payouts
// Language: Node.js (v18+)
//
// Paste this code into your Appwrite Function index.js, or deploy it via Appwrite CLI.
// Make sure to add 'node-appwrite' to your function's package.json dependencies.

const { Client, Databases, Query } = require("node-appwrite");

// Calculate Platform Fees based on Member Plan Tiers
function getTranslatorFeePercent(tier) {
  const t = (tier || "free").toLowerCase().trim();
  if (t === "plus") return 0.05; // 5% fee
  if (t === "standard" || t === "pro") return 0.10; // 10% fee
  return 0.20; // 20% fee (free tier)
}

// Exchange sandbox/live OAuth token for PayPal
async function getPaypalAccessToken(clientId, clientSecret, mode, log, error) {
  const host = mode === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com";
  const url = `https://${host}/v1/oauth2/token`;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  log(`🔐 Authenticating with PayPal API (${mode} mode)...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return data.access_token;
  } catch (err) {
    error("❌ PayPal Authentication failed: " + err.message);
    throw err;
  }
}

// Trigger PayPal Payouts API to send funds directly to translator's PayPal email
async function sendPaypalPayout(accessToken, payoutEmail, amount, jobId, jobTitle, mode, log, error) {
  const host = mode === "live" ? "api-m.paypal.com" : "api-m.sandbox.paypal.com";
  const url = `https://${host}/v1/payments/payouts`;

  const payoutPayload = {
    sender_batch_header: {
      sender_batch_id: `batch_${jobId}_${Date.now()}`,
      email_subject: "You have received a payment from Tranzlo!",
      recipient_type: "EMAIL"
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: {
          value: parseFloat(amount).toFixed(2),
          currency: "USD"
        },
        note: `Payment for translation project: "${jobTitle}"`,
        receiver: payoutEmail.trim(),
        sender_item_id: jobId
      }
    ]
  };

  log(`💸 Executing PayPal Payout of $${payoutPayload.items[0].amount.value} to ${payoutEmail}...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payoutPayload)
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = JSON.parse(text);
    const batchId = data.batch_header?.payout_batch_id || "unknown_batch";
    log(`   ✅ Payout initiated successfully! Batch ID: ${batchId}`);
    return batchId;
  } catch (err) {
    error("❌ PayPal Payout API failed: " + err.message);
    throw err;
  }
}

module.exports = async function (context) {
  const { req, res, log, error } = context;

  // 1. Read Environment Variables
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.tranzlo.net/v1";
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY; 
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";

  // PayPal configs
  const paypalClientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const paypalMode = process.env.PAYPAL_MODE || "sandbox"; // 'sandbox' or 'live'

  if (!endpoint || !projectId || !apiKey) {
    error("❌ Missing required Appwrite environment variables.");
    return res.json({ success: false, error: "Appwrite configuration missing." }, 500);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  log("🚀 Starting Daily 30-Day Escrow Payout Scheduler...");
  
  const now = new Date().toISOString();
  let processedCount = 0;
  const processedJobs = [];

  try {
    // 2. Query jobs that are "approved" and releaseAt <= now
    log(`🔍 Querying jobs eligible for payout release (releaseAt <= ${now})...`);
    const eligibleJobs = await db.listDocuments(databaseId, "jobs", [
      Query.equal("escrowStatus", "approved"),
      Query.lessThanEqual("releaseAt", now),
      Query.limit(100) // process in batches of 100 max per run
    ]);

    log(`Found ${eligibleJobs.documents.length} eligible jobs for payout release.`);

    // 3. Authenticate with PayPal if credentials are provided
    let paypalAccessToken = null;
    const canPaypalPayout = paypalClientId && paypalClientSecret;
    if (canPaypalPayout) {
      try {
        paypalAccessToken = await getPaypalAccessToken(paypalClientId, paypalClientSecret, paypalMode, log, error);
      } catch (authErr) {
        log("⚠️ PayPal Auth failed. Payouts will only credit availableBalance in DB instead of direct cash transfer.");
      }
    } else {
      log("ℹ️ PayPal credentials not configured. Payouts will credit availableBalance internally inside Tranzlo profile.");
    }

    for (const job of eligibleJobs.documents) {
      log(`----------------------------------------------------------------`);
      log(`👉 Processing Job ID: ${job.$id} - "${job.title}"`);
      log(`   Budget: $${job.budget} | Escrow Amount: $${job.escrowAmount}`);

      const translatorId = job.activeTranslatorId;
      if (!translatorId) {
        error(`   ❌ Job has no activeTranslatorId. Skipping.`);
        continue;
      }

      try {
        // 4. Fetch translator profile
        log(`   🔍 Fetching translator profile for ID: ${translatorId}...`);
        const translatorProfiles = await db.listDocuments(databaseId, "translator_profiles", [
          Query.equal("userId", translatorId),
          Query.limit(1)
        ]);

        if (translatorProfiles.documents.length === 0) {
          error(`   ❌ Translator profile not found for ID: ${translatorId}. Skipping.`);
          continue;
        }

        const translator = translatorProfiles.documents[0];
        const translatorTier = translator.planTier || "free";
        const feePercent = getTranslatorFeePercent(translatorTier);
        const feeDeducted = job.budget * feePercent;
        const netPayout = job.budget - feeDeducted;

        log(`   💼 Translator: ${translator.fullName} (Tier: ${translatorTier})`);
        log(`   Platform Fee: ${(feePercent * 100).toFixed(0)}% ($${feeDeducted.toFixed(2)})`);
        log(`   Translator Payout Share: $${netPayout.toFixed(2)}`);

        let paypalBatchId = "virtual_only";
        let payoutSentViaPaypal = false;

        // 5. Attempt Direct PayPal Payout if email & config exists
        const translatorPaypalEmail = translator.paypalEmail || translator.email;
        if (paypalAccessToken && translatorPaypalEmail) {
          try {
            paypalBatchId = await sendPaypalPayout(
              paypalAccessToken,
              translatorPaypalEmail,
              netPayout,
              job.$id,
              job.title,
              paypalMode,
              log,
              error
            );
            payoutSentViaPaypal = true;
            log(`   ✅ Direct PayPal payout initiated to ${translatorPaypalEmail}`);
          } catch (payoutErr) {
            error(`   ❌ PayPal Payout API failed: ${payoutErr.message}. Crediting internally instead.`);
          }
        } else {
          if (!translatorPaypalEmail) {
            log(`   ⚠️ Translator has no PayPal email configured. Crediting internally to availableBalance.`);
          } else {
            log(`   ℹ️ PayPal payout skipped (no active PayPal token). Crediting internally to availableBalance.`);
          }
        }

        // 6. Update Translator Profile Available Balance
        const currentBalance = translator.availableBalance || 0;
        const newBalance = currentBalance + netPayout;
        await db.updateDocument(databaseId, "translator_profiles", translator.$id, {
          availableBalance: newBalance,
          updatedAt: now
        });
        log(`   ✅ Credited availableBalance inside DB ($${currentBalance.toFixed(2)} -> $${newBalance.toFixed(2)})`);

        // 7. Update Job Status to Released
        await db.updateDocument(databaseId, "jobs", job.$id, {
          escrowStatus: "released",
          platformFeeDeducted: feeDeducted,
          updatedAt: now
        });
        log(`   ✅ Job escrowStatus set to "released".`);

        // 8. Update Application Status to Released (if match exists)
        try {
          const apps = await db.listDocuments(databaseId, "applications", [
            Query.equal("jobId", job.$id),
            Query.equal("translatorId", translatorId),
            Query.limit(1)
          ]);
          if (apps.documents.length > 0) {
            const app = apps.documents[0];
            await db.updateDocument(databaseId, "applications", app.$id, {
              escrowStatus: "released",
              platformFeeDeducted: feeDeducted,
              updatedAt: now
            });
            log(`   ✅ Application ${app.$id} escrowStatus set to "released".`);
          }
        } catch (appErr) {
          log(`   ⚠️ Could not update application state: ${appErr.message}`);
        }

        processedCount++;
        processedJobs.push({
          jobId: job.$id,
          title: job.title,
          translator: translator.fullName,
          netPayout,
          feeDeducted,
          paypalBatchId,
          paypalSent: payoutSentViaPaypal
        });

      } catch (jobProcessErr) {
        error(`   ❌ Failed to process payout for Job ${job.$id}: ${jobProcessErr.message}`);
      }
    }

  } catch (err) {
    error("❌ Daily Payout Scheduler failed: " + err.message);
    return res.json({ success: false, error: err.message }, 500);
  }

  log(`----------------------------------------------------------------`);
  log(`🏁 Payout Scheduler finished. Successfully processed ${processedCount} payouts.`);
  return res.json({
    success: true,
    processedCount,
    jobs: processedJobs
  });
};
