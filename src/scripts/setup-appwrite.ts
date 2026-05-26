// Tranzlo Appwrite Database Setup
// Run: npx tsx src/scripts/setup-appwrite.ts
//
// Requires: APPWRITE_API_KEY in .env.local (server key with collections scope)

import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(__dirname, "../../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found");
  process.exit(1);
}
for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#")) {
    const eq = t.indexOf("=");
    if (eq > 0) {
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[t.slice(0, eq).trim()] = v;
    }
  }
}

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: projectId,
  APPWRITE_API_KEY: apiKey,
} = process.env;

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "tranzlo_main";
const DATABASE_NAME = "Tranzlo Main";

if (!endpoint || !projectId || !apiKey) {
  console.error("❌ Missing NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, or APPWRITE_API_KEY in .env.local");
  process.exit(1);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Attr {
  key: string;
  type: "string" | "integer" | "float" | "boolean" | "datetime" | "enum";
  size?: number;
  required: boolean;
  array?: boolean;
  elements?: string[];
  default?: unknown;
}

interface Idx {
  id: string;
  type: "key" | "unique" | "fulltext";
  attributes: string[];
  orders?: string[];
}

interface Col {
  id: string;
  name: string;
  attrs: Attr[];
  indexes: Idx[];
}

const SCHEMA: Col[] = [
  {
    id: "translator_profiles", name: "Translator Profiles",
    attrs: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "email", type: "string", size: 255, required: true },
      { key: "fullName", type: "string", size: 255, required: true },
      { key: "bio", type: "string", size: 2000, required: false },
      { key: "languages", type: "string", size: 64, required: false, array: true },
      { key: "specializations", type: "string", size: 128, required: false, array: true },
      { key: "hourlyRate", type: "float", required: false },
      { key: "avatarUrl", type: "string", size: 512, required: false },
      { key: "phone", type: "string", size: 32, required: false },
      { key: "isVerified", type: "boolean", required: false, default: false },
      { key: "verificationStatus", type: "enum", elements: ["unverified", "pending", "verified", "rejected"], required: false, default: "unverified" },
      { key: "isApproved", type: "boolean", required: false, default: false },
      { key: "status", type: "enum", elements: ["active", "inactive", "suspended"], required: false, default: "active" },
      { key: "completedJobs", type: "integer", required: false, default: 0 },
      { key: "rating", type: "float", required: false, default: 0 },
      { key: "ratingCount", type: "integer", required: false, default: 0 },
      { key: "cvUrl", type: "string", size: 512, required: false },
      { key: "planTier", type: "string", size: 32, required: false, default: "free" },
      { key: "trialEndsAt", type: "datetime", required: false },
      { key: "trialStatus", type: "string", size: 32, required: false },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_tprof_userId", type: "unique", attributes: ["userId"] },
      { id: "idx_tprof_email", type: "unique", attributes: ["email"] },
      { id: "idx_tprof_verificationStatus", type: "key", attributes: ["verificationStatus"] },
    ],
  },
  {
    id: "company_profiles", name: "Company Profiles",
    attrs: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "email", type: "string", size: 255, required: true },
      { key: "companyName", type: "string", size: 255, required: true },
      { key: "fullName", type: "string", size: 255, required: true },
      { key: "contactPerson", type: "string", size: 255, required: true },
      { key: "logoUrl", type: "string", size: 512, required: false },
      { key: "phone", type: "string", size: 32, required: false },
      { key: "isVerified", type: "boolean", required: false, default: false },
      { key: "verificationStatus", type: "enum", elements: ["unverified", "pending", "verified", "rejected"], required: false, default: "unverified" },
      { key: "isApproved", type: "boolean", required: false, default: false },
      { key: "status", type: "enum", elements: ["active", "inactive", "suspended"], required: false, default: "active" },
      { key: "registrationDoc", type: "string", size: 512, required: false },
      { key: "taxDoc", type: "string", size: 512, required: false },
      { key: "planTier", type: "string", size: 32, required: false, default: "free" },
      { key: "trialEndsAt", type: "datetime", required: false },
      { key: "trialStatus", type: "string", size: 32, required: false },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_cprof_userId", type: "unique", attributes: ["userId"] },
      { id: "idx_cprof_email", type: "unique", attributes: ["email"] },
      { id: "idx_cprof_verificationStatus", type: "key", attributes: ["verificationStatus"] },
    ],
  },
  {
    id: "jobs", name: "Jobs",
    attrs: [
      { key: "companyId", type: "string", size: 64, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 10000, required: true },
      { key: "sourceLanguage", type: "string", size: 8, required: true },
      { key: "targetLanguage", type: "string", size: 8, required: true },
      { key: "country", type: "string", size: 8, required: true },
      { key: "remote", type: "boolean", required: false, default: true },
      { key: "budget", type: "float", required: true },
      { key: "deadline", type: "datetime", required: true },
      { key: "specialization", type: "string", size: 128, required: true },
      { key: "status", type: "enum", elements: ["open", "closed", "filled", "cancelled"], required: true },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_jobs_companyId", type: "key", attributes: ["companyId"] },
      { id: "idx_jobs_status", type: "key", attributes: ["status"] },
      { id: "idx_jobs_languages", type: "key", attributes: ["sourceLanguage", "targetLanguage"] },
      { id: "idx_jobs_specialization", type: "key", attributes: ["specialization"] },
      { id: "idx_jobs_createdAt", type: "key", attributes: ["createdAt"], orders: ["DESC"] },
    ],
  },
  {
    id: "applications", name: "Applications",
    attrs: [
      { key: "jobId", type: "string", size: 64, required: true },
      { key: "translatorId", type: "string", size: 64, required: true },
      { key: "coverLetter", type: "string", size: 10000, required: true },
      { key: "cvUrl", type: "string", size: 512, required: false },
      { key: "status", type: "enum", elements: ["submitted", "viewed", "shortlisted", "accepted", "rejected", "withdrawn"], required: true },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_apps_jobId", type: "key", attributes: ["jobId"] },
      { id: "idx_apps_translatorId", type: "key", attributes: ["translatorId"] },
      { id: "idx_apps_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "conversations", name: "Conversations",
    attrs: [
      { key: "participants", type: "string", size: 64, required: true, array: true },
      { key: "jobId", type: "string", size: 64, required: false },
      { key: "lastMessageAt", type: "datetime", required: false },
      { key: "lastMessagePreview", type: "string", size: 255, required: false },
      { key: "createdAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_conv_participants", type: "key", attributes: ["participants"] },
    ],
  },
  {
    id: "messages", name: "Messages",
    attrs: [
      { key: "conversationId", type: "string", size: 64, required: true },
      { key: "senderId", type: "string", size: 64, required: true },
      { key: "content", type: "string", size: 5000, required: true },
      { key: "read", type: "boolean", required: false, default: false },
      { key: "createdAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_msg_conversationId", type: "key", attributes: ["conversationId"] },
      { id: "idx_msg_createdAt", type: "key", attributes: ["createdAt"], orders: ["ASC"] },
    ],
  },
  {
    id: "notifications", name: "Notifications",
    attrs: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "type", type: "string", size: 64, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "body", type: "string", size: 2000, required: true },
      { key: "data", type: "string", size: 2000, required: false },
      { key: "read", type: "boolean", required: false, default: false },
      { key: "createdAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_notif_userId", type: "key", attributes: ["userId"] },
      { id: "idx_notif_read", type: "key", attributes: ["read"] },
      { id: "idx_notif_createdAt", type: "key", attributes: ["createdAt"], orders: ["DESC"] },
    ],
  },
  {
    id: "verification_requests", name: "Verification Requests",
    attrs: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "role", type: "enum", elements: ["translator", "company"], required: true },
      { key: "status", type: "enum", elements: ["unverified", "pending", "verified", "rejected"], required: true },
      { key: "adminNote", type: "string", size: 2000, required: false },
      { key: "reviewedBy", type: "string", size: 64, required: false },
      { key: "reviewedAt", type: "datetime", required: false },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_vr_userId", type: "key", attributes: ["userId"] },
      { id: "idx_vr_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "blog_posts", name: "Blog Posts",
    attrs: [
      { key: "authorId", type: "string", size: 64, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "slug", type: "string", size: 255, required: true },
      { key: "excerpt", type: "string", size: 500, required: true },
      { key: "content", type: "string", size: 50000, required: true },
      { key: "coverImage", type: "string", size: 512, required: false },
      { key: "tags", type: "string", size: 64, required: false, array: true },
      { key: "status", type: "enum", elements: ["draft", "scheduled", "pending_review", "published", "rejected"], required: true },
      { key: "scheduledAt", type: "datetime", required: false },
      { key: "publishedAt", type: "datetime", required: false },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_blog_slug", type: "unique", attributes: ["slug"] },
      { id: "idx_blog_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "hub_posts", name: "Hub Posts",
    attrs: [
      { key: "authorId", type: "string", size: 64, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "content", type: "string", size: 10000, required: true },
      { key: "category", type: "string", size: 64, required: true },
      { key: "likes", type: "string", size: 64, required: false, array: true },
      { key: "status", type: "enum", elements: ["draft", "pending_review", "published", "rejected", "hidden"], required: true },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_hub_status", type: "key", attributes: ["status"] },
      { id: "idx_hub_category", type: "key", attributes: ["category"] },
    ],
  },
  {
    id: "complaints", name: "Complaints",
    attrs: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "subject", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 5000, required: true },
      { key: "adminReply", type: "string", size: 5000, required: false },
      { key: "status", type: "enum", elements: ["open", "pending", "resolved", "rejected"], required: true },
      { key: "resolvedBy", type: "string", size: 64, required: false },
      { key: "resolvedAt", type: "datetime", required: false },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_comp_userId", type: "key", attributes: ["userId"] },
      { id: "idx_comp_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "disputes", name: "Disputes",
    attrs: [
      { key: "jobId", type: "string", size: 64, required: true },
      { key: "raisedById", type: "string", size: 64, required: true },
      { key: "reason", type: "string", size: 5000, required: true },
      { key: "adminDecisionNote", type: "string", size: 5000, required: false },
      { key: "decision", type: "enum", elements: ["release", "refund", "dismiss"], required: false },
      { key: "status", type: "enum", elements: ["open", "pending", "resolved", "rejected"], required: true },
      { key: "resolvedBy", type: "string", size: 64, required: false },
      { key: "resolvedAt", type: "datetime", required: false },
      { key: "createdAt", type: "datetime", required: false },
      { key: "updatedAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_disp_jobId", type: "key", attributes: ["jobId"] },
      { id: "idx_disp_raisedById", type: "key", attributes: ["raisedById"] },
      { id: "idx_disp_status", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "ratings", name: "Ratings",
    attrs: [
      { key: "jobId", type: "string", size: 64, required: true },
      { key: "fromUserId", type: "string", size: 64, required: true },
      { key: "toUserId", type: "string", size: 64, required: true },
      { key: "stars", type: "integer", required: true },
      { key: "reviewText", type: "string", size: 1000, required: false },
      { key: "createdAt", type: "datetime", required: false },
    ],
    indexes: [
      { id: "idx_rating_jobId", type: "key", attributes: ["jobId"] },
      { id: "idx_rating_toUserId", type: "key", attributes: ["toUserId"] },
    ],
  },
];

async function main() {
  const { Client, Databases, Permission, Role } = await import("node-appwrite");
  const client = new Client().setEndpoint(endpoint!).setProject(projectId!).setKey(apiKey!);
  const db = new Databases(client);

  console.log(`\n📦 Database: ${DATABASE_NAME} (${DATABASE_ID})`);
  try {
    await db.create(DATABASE_ID, DATABASE_NAME);
    console.log("   ✅ Created\n");
  } catch (e: any) {
    if (e.message?.includes("already exists")) console.log("   ⚠️  Already exists\n");
    else throw e;
  }
  await wait(1000);

  for (const col of SCHEMA) {
    console.log(`📁 ${col.name} (${col.id})`);
    try {
      await db.createCollection(DATABASE_ID, col.id, col.name, [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]);
      console.log("   ✅ Collection");
    } catch (e: any) {
      if (e.message?.includes("already exists")) console.log("   ⚠️  Collection exists");
      else throw e;
    }
    await wait(500);

    for (const a of col.attrs) {
      try {
        const dbId = DATABASE_ID;
        const colId = col.id;
        const def = a.default;
        const defVal: any = a.default;
        const arr: any = a.array;
        switch (a.type) {
          case "string":
            await db.createStringAttribute(dbId, colId, a.key, a.size ?? 255, a.required, defVal, arr);
            break;
          case "integer":
            await db.createIntegerAttribute(dbId, colId, a.key, a.required, undefined, undefined, defVal, arr);
            break;
          case "float":
            await db.createFloatAttribute(dbId, colId, a.key, a.required, undefined, undefined, defVal, arr);
            break;
          case "boolean":
            await db.createBooleanAttribute(dbId, colId, a.key, a.required, defVal, arr);
            break;
          case "datetime":
            await db.createDatetimeAttribute(dbId, colId, a.key, a.required, defVal, arr);
            break;
          case "enum":
            await db.createEnumAttribute(dbId, colId, a.key, a.elements!, a.required, defVal, arr);
            break;
        }
        console.log(`   ✅ ${a.key} (${a.type})`);
      } catch (e: any) {
        if (e.message?.includes("already exists")) console.log(`   ⚠️  ${a.key} exists`);
        else console.error(`   ❌ ${a.key}:`, e.message);
      }
      await wait(300);
    }

    const { DatabasesIndexType, OrderBy } = await import("node-appwrite");
    const INDEX_TYPES: Record<string, any> = {
      key: DatabasesIndexType.Key,
      unique: DatabasesIndexType.Unique,
      fulltext: DatabasesIndexType.Fulltext,
    };
    const ORDER_MAP: Record<string, any> = {
      ASC: OrderBy.Asc,
      DESC: OrderBy.Desc,
    };
    for (const idx of col.indexes) {
      try {
        const orders = idx.orders?.map((o) => ORDER_MAP[o]) as any;
        await db.createIndex(DATABASE_ID, col.id, idx.id, INDEX_TYPES[idx.type], idx.attributes, orders);
        console.log(`   ✅ Index: ${idx.id}`);
      } catch (e: any) {
        if (e.message?.includes("already exists")) console.log(`   ⚠️  Index ${idx.id} exists`);
        else console.error(`   ❌ Index ${idx.id}:`, e.message);
      }
      await wait(500);
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════");
  console.log("  ✅ ALL COLLECTIONS READY");
  console.log("═══════════════════════════════════════");
  console.log(`\nDatabase ID: ${DATABASE_ID}`);
  console.log("Collections:");
  SCHEMA.forEach((c) => console.log(`   • ${c.id}`));
  console.log("\nNext: Set NEXT_PUBLIC_USE_MOCK_DATA=false in .env.local and restart.");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
