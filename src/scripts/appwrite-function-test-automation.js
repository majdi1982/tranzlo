// Appwrite Function: Translation Test Automation Engine
// Language: Node.js (v18+)
//
// TWO MODES:
// 1. EVENT TRIGGER: Fires when a new application is created -> checks if test should start
// 2. CRON TRIGGER: Runs every hour -> checks 24h no-fill threshold & 48h test timeouts
//
// Events listened to:
//   - databases.{DB_ID}.collections.applications.documents.create
// Cron schedule: every hour  "0 * * * *"

const { Client, Databases, Query, ID } = require("node-appwrite");

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";
const COLS = {
  jobs: "jobs",
  applications: "applications",
  conversations: "conversations",
  messages: "messages",
  notifications: "notifications",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: initialize Appwrite client
// ─────────────────────────────────────────────────────────────────────────────
function buildClient() {
  const endpoint =
    process.env.APPWRITE_FUNCTION_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
    "https://appwrite.tranzlo.net/v1";
  const projectId =
    process.env.APPWRITE_FUNCTION_PROJECT_ID ||
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    throw new Error("❌ Missing Appwrite environment credentials.");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  return new Databases(client);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: generate a readable unique ID
// ─────────────────────────────────────────────────────────────────────────────
function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Launch the test for a given job and set of applicant application docs
// Creates a conversation + sends automated test message to each applicant
// ─────────────────────────────────────────────────────────────────────────────
async function launchTestForApplicants(db, job, applicants, log) {
  const now = new Date().toISOString();
  const testDeadline = new Date(
    Date.now() + (job.testDuration || 48) * 60 * 60 * 1000
  ).toISOString();

  log(
    `🚀 Launching test for job "${job.title}" (${job.$id}) — ${applicants.length} applicants`
  );

  // Mark job as test_launched so we don't re-trigger
  await db.updateDocument(DB_ID, COLS.jobs, job.$id, {
    testDistributedAt: now,
    testDeadline,
    testLaunched: true,
    updatedAt: now,
  });

  for (const app of applicants) {
    const translatorId = app.translatorId;
    const languagePair = app.languagePair || "";

    try {
      // 1. Create private conversation between company and translator
      const conv = await db.createDocument(
        DB_ID,
        COLS.conversations,
        uid("conv"),
        {
          participants: [job.companyId, translatorId],
          jobId: job.$id,
          createdAt: now,
        }
      );

      // 2. Send automated test invitation message with the test file
      let msg = `👋 Hello! You have been selected to take the translation test for the project:\n\n📌 *${job.title}*\n\n`;
      msg += `🌐 Language Pair: ${languagePair || "See job details"}\n`;
      msg += `📝 Word Count: Max ${job.testWordCount || 250} words\n`;
      msg += `⏰ Deadline: You have ${job.testDuration || 48} hours from now to submit your solution.\n`;
      msg += `📅 Submission Deadline: ${new Date(testDeadline).toLocaleString("en-US", { timeZone: "Asia/Riyadh" })} (AST)\n\n`;

      if (job.testFileUrl) {
        msg += `📎 Test File Download:\n${job.testFileUrl}\n\n`;
      }

      msg += `📤 Please upload your completed translation solution directly in this conversation.\n`;
      msg += `⚠️ Note: Failure to submit within the deadline will result in automatic disqualification.\n\n`;
      msg += `Good luck! 🌟`;

      await db.createDocument(DB_ID, COLS.messages, uid("msg"), {
        conversationId: conv.$id,
        senderId: job.companyId,
        content: msg,
        read: false,
        createdAt: now,
      });

      // 3. Update application: set status to test_invited, store conversation & deadline
      await db.updateDocument(DB_ID, COLS.applications, app.$id, {
        status: "test_invited",
        conversationId: conv.$id,
        testInvitedAt: now,
        testDeadline,
        updatedAt: now,
      });

      // 4. Send notification to translator
      await db.createDocument(DB_ID, COLS.notifications, uid("notif"), {
        userId: translatorId,
        type: "test_distributed",
        title: "🎯 Translation Test Invitation",
        body: `You have been selected to take the translation test for "${job.title}". Check your messages to download the test file. Deadline: ${job.testDuration || 48} hours.`,
        data: JSON.stringify({ jobId: job.$id, conversationId: conv.$id }),
        read: false,
        createdAt: now,
      });

      log(`   ✅ Test launched for translator: ${translatorId}`);
    } catch (err) {
      log(`   ❌ Failed to launch test for translator ${translatorId}: ${err.message}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 1: Called when a new application document is CREATED
// Checks if we've hit maxTestApplicants for that language pair → launch test
// ─────────────────────────────────────────────────────────────────────────────
async function handleNewApplication(db, payload, log) {
  const applicationDoc = payload?.document || payload;
  if (!applicationDoc) {
    log("⏭️ No application document in payload. Skipping.");
    return;
  }

  const jobId = applicationDoc.jobId;
  if (!jobId) {
    log("⏭️ Application has no jobId. Skipping.");
    return;
  }

  // Fetch the job
  let job;
  try {
    job = await db.getDocument(DB_ID, COLS.jobs, jobId);
  } catch {
    log(`⏭️ Job ${jobId} not found.`);
    return;
  }

  // Only process jobs that require a test, are still open, and haven't been launched yet
  if (!job.requiresTest) {
    log(`⏭️ Job ${jobId} does not require a test. Skipping.`);
    return;
  }
  if (job.testLaunched) {
    log(`⏭️ Test for job ${jobId} already launched. Skipping.`);
    return;
  }
  if (job.status !== "open") {
    log(`⏭️ Job ${jobId} is not open (status: ${job.status}). Skipping.`);
    return;
  }

  const maxTestApplicants = job.maxTestApplicants || 10;
  const languagePair = applicationDoc.languagePair || "";

  log(`🔍 Checking applicant count for job "${job.title}" (pair: ${languagePair})...`);

  // Count applicants for the same language pair
  const allAppsResult = await db.listDocuments(DB_ID, COLS.applications, [
    Query.equal("jobId", jobId),
    Query.limit(500),
  ]);

  const pairApps = allAppsResult.documents.filter((a) => {
    if (!languagePair) return true;
    const normalized = (s) => s.replace(/\s+/g, "").toUpperCase();
    return normalized(a.languagePair || "") === normalized(languagePair);
  });

  const pendingApps = pairApps.filter(
    (a) => a.status === "submitted" || a.status === "pending"
  );

  log(
    `   Found ${pendingApps.length}/${maxTestApplicants} applicants for pair "${languagePair}"`
  );

  if (pendingApps.length >= maxTestApplicants) {
    log(
      `   🎯 Reached max applicants (${maxTestApplicants})! Launching test immediately.`
    );
    await launchTestForApplicants(db, job, pendingApps, log);

    // Close the job to new applications for this pair
    await db.updateDocument(DB_ID, COLS.jobs, jobId, {
      status: "filled",
      updatedAt: new Date().toISOString(),
    });
    log(`   ✅ Job ${jobId} closed to new applications.`);
  } else {
    log(
      `   ℹ️ Not enough applicants yet (${pendingApps.length}/${maxTestApplicants}). Waiting...`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 2: Cron – Runs every hour
// Task A: Jobs older than 24h that haven't launched yet → launch with current applicants
// Task B: Applications past their test deadline → auto-fail them
// ─────────────────────────────────────────────────────────────────────────────
async function handleCronTick(db, log) {
  const now = new Date();
  log(`⏰ Cron tick at ${now.toISOString()}`);

  // ── Task A: Launch tests for jobs older than 24h ──────────────────────────
  log("🔍 [Task A] Checking for stale un-launched test jobs (>24h old)...");
  try {
    const threshold24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const staleJobsResult = await db.listDocuments(DB_ID, COLS.jobs, [
      Query.equal("requiresTest", true),
      Query.equal("status", "open"),
      Query.equal("testLaunched", false),
      Query.lessThan("createdAt", threshold24h),
      Query.limit(50),
    ]);

    log(`   Found ${staleJobsResult.documents.length} stale job(s).`);

    for (const job of staleJobsResult.documents) {
      // Get all pending applicants for this job
      const appsResult = await db.listDocuments(DB_ID, COLS.applications, [
        Query.equal("jobId", job.$id),
        Query.equal("status", "submitted"),
        Query.limit(500),
      ]);

      if (appsResult.documents.length === 0) {
        log(`   ⏭️ Job "${job.title}" (${job.$id}) has 0 applicants. Skipping.`);
        continue;
      }

      log(
        `   🚀 Force-launching test for job "${job.title}" with ${appsResult.documents.length} current applicant(s).`
      );
      await launchTestForApplicants(db, job, appsResult.documents, log);

      // Close to new applicants
      await db.updateDocument(DB_ID, COLS.jobs, job.$id, {
        status: "filled",
        updatedAt: now.toISOString(),
      });
    }
  } catch (err) {
    log(`   ❌ Task A error: ${err.message}`);
  }

  // ── Task B: Auto-fail applications past their test deadline ───────────────
  log("🔍 [Task B] Checking for overdue test submissions...");
  try {
    const overdueAppsResult = await db.listDocuments(DB_ID, COLS.applications, [
      Query.equal("status", "test_invited"),
      Query.lessThan("testDeadline", now.toISOString()),
      Query.limit(200),
    ]);

    log(`   Found ${overdueAppsResult.documents.length} overdue application(s).`);

    for (const app of overdueAppsResult.documents) {
      try {
        // Mark as auto-failed
        await db.updateDocument(DB_ID, COLS.applications, app.$id, {
          status: "rejected",
          testStatus: "failed",
          rejectionReason: "Test deadline exceeded. Submission time has passed.",
          testGradedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });

        // Notify the translator
        await db.createDocument(DB_ID, COLS.notifications, uid("notif"), {
          userId: app.translatorId,
          type: "test_expired",
          title: "⏰ Test Deadline Passed",
          body: `Your translation test deadline has expired. Unfortunately, your application has been automatically disqualified. Please look for other opportunities on Tranzlo.`,
          data: JSON.stringify({ jobId: app.jobId }),
          read: false,
          createdAt: now.toISOString(),
        });

        // If there was a conversation, send a final message
        if (app.conversationId) {
          await db.createDocument(DB_ID, COLS.messages, uid("msg"), {
            conversationId: app.conversationId,
            senderId: "system",
            content:
              "⏰ The test deadline has passed. This application has been automatically disqualified. Thank you for your participation.",
            read: false,
            createdAt: now.toISOString(),
          });
        }

        log(`   ✅ Auto-failed application ${app.$id} (translator: ${app.translatorId})`);
      } catch (err) {
        log(`   ❌ Failed to auto-fail app ${app.$id}: ${err.message}`);
      }
    }
  } catch (err) {
    log(`   ❌ Task B error: ${err.message}`);
  }

  log("✅ Cron tick complete.");
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
module.exports = async function (context) {
  const { req, res, log, error } = context;

  let db;
  try {
    db = buildClient();
  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: err.message }, 500);
  }

  // Determine if triggered by event or cron
  const triggerType = req.headers["x-appwrite-trigger"] || "event";
  log(`📣 Trigger type: ${triggerType}`);

  try {
    if (triggerType === "schedule") {
      // CRON MODE
      await handleCronTick(db, log);
    } else {
      // EVENT MODE: a new application document was created
      let payload = {};
      try {
        payload =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      } catch {
        payload = {};
      }
      await handleNewApplication(db, payload, log);
    }

    return res.json({ success: true });
  } catch (err) {
    error(`Fatal error: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
