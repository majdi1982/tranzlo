import { Client, Databases, Storage, ID, Permission, Role, DatabasesIndexType } from "node-appwrite";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

const databases = new Databases(client);
const storage = new Storage(client);

async function setup() {
  const dbId = "main";
  const commonPermissions = [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ];
  
  try {
    console.log("Checking for existing database...");
    try {
      await databases.get(dbId);
    } catch (e) {
      await databases.create(dbId, "Tranzlo Main Database");
    }

    const schema = [
      {
        id: "users",
        name: "Central Users",
        attributes: [
          { name: "name", type: "string", size: 255, required: true },
          { name: "email", type: "string", size: 255, required: true },
          { name: "role", type: "string", size: 50, required: true },
          { name: "country", type: "string", size: 100, required: false },
          { name: "rating", type: "float", required: false },
          { name: "verified", type: "boolean", required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "projects",
        name: "Projects",
        attributes: [
          { name: "title", type: "string", size: 255, required: true },
          { name: "description", type: "string", size: 5000, required: true },
          { name: "sourceLanguage", type: "string", size: 50, required: false },
          { name: "targetLanguage", type: "string", size: 50, required: false },
          { name: "budget", type: "integer", required: true },
          { name: "deadline", type: "string", size: 100, required: false },
          { name: "status", type: "string", size: 50, required: true },
          { name: "companyId", type: "string", size: 255, required: true },
          { name: "hiredTranslatorId", type: "string", size: 255, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "bids",
        name: "Bids",
        attributes: [
          { name: "jobId", type: "string", size: 255, required: true },
          { name: "translatorId", type: "string", size: 255, required: true },
          { name: "proposalText", type: "string", size: 5000, required: true },
          { name: "price", type: "integer", required: true },
          { name: "deliveryTime", type: "string", size: 100, required: false },
          { name: "status", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "invitations",
        name: "Invitations",
        attributes: [
          { name: "jobId", type: "string", size: 255, required: true },
          { name: "companyId", type: "string", size: 255, required: true },
          { name: "translatorId", type: "string", size: 255, required: true },
          { name: "message", type: "string", size: 1000, required: false },
          { name: "status", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "reviews",
        name: "Reviews",
        attributes: [
          { name: "jobId", type: "string", size: 255, required: true },
          { name: "reviewerId", type: "string", size: 255, required: true },
          { name: "revieweeId", type: "string", size: 255, required: true },
          { name: "rating", type: "integer", required: true },
          { name: "comment", type: "string", size: 1000, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "kyc",
        name: "KYC Data",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "documentType", type: "string", size: 50, required: true },
          { name: "documentUrl", type: "string", size: 500, required: true },
          { name: "status", type: "string", size: 50, required: true },
          { name: "rejectionReason", type: "string", size: 1000, required: false },
          { name: "submittedAt", type: "string", size: 100, required: true },
          { name: "updatedAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "notifications",
        name: "Notifications",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "type", type: "string", size: 50, required: true },
          { name: "content", type: "string", size: 1000, required: true },
          { name: "link", type: "string", size: 500, required: false },
          { name: "read", type: "boolean", required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "chat_rooms",
        name: "Chat Rooms",
        attributes: [
          { name: "jobId", type: "string", size: 255, required: true },
          { name: "participants", type: "string", size: 255, required: true, array: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "messages",
        name: "Project Messages",
        attributes: [
          { name: "projectId", type: "string", size: 255, required: true },
          { name: "senderId", type: "string", size: 255, required: true },
          { name: "text", type: "string", size: 5000, required: true },
          { name: "type", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "companies",
        name: "Companies",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "companyName", type: "string", size: 255, required: true },
          { name: "contactName", type: "string", size: 255, required: true },
          { name: "email", type: "string", size: 255, required: true },
          { name: "country", type: "string", size: 100, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "translators",
        name: "Translators",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "name", type: "string", size: 255, required: true },
          { name: "email", type: "string", size: 255, required: true },
          { name: "languages", type: "string", size: 255, required: false, array: true },
          { name: "country", type: "string", size: 100, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      }
    ];

    for (const col of schema) {
      console.log(`Ensuring Collection: ${col.name} (${col.id})...`);
      try {
        await databases.getCollection(dbId, col.id);
        await databases.updateCollection(dbId, col.id, col.name, commonPermissions);
      } catch (e) {
        await databases.createCollection(dbId, col.id, col.name, commonPermissions);
        for (const attr of col.attributes) {
          if (attr.type === "string") {
            await databases.createStringAttribute(dbId, col.id, attr.name, attr.size!, attr.required, undefined, (attr as any).array);
          } else if (attr.type === "integer") {
            await databases.createIntegerAttribute(dbId, col.id, attr.name, attr.required);
          } else if (attr.type === "boolean") {
            await databases.createBooleanAttribute(dbId, col.id, attr.name, attr.required);
          } else if (attr.type === "float") {
            await databases.createFloatAttribute(dbId, col.id, attr.name, attr.required);
          }
          await new Promise(r => setTimeout(r, 500));
        }

        // Add default indexes for filtering
        const indexMap: Record<string, string[]> = {
          "projects": ["companyId", "status", "createdAt"],
          "bids": ["jobId", "status", "translatorId"],
          "invitations": ["jobId", "companyId", "translatorId", "status"],
          "reviews": ["jobId", "reviewerId", "revieweeId"],
          "kyc": ["userId", "status"],
          "notifications": ["userId", "read", "createdAt"],
          "users": ["role", "email"],
          "chat_rooms": ["jobId"],
          "messages": ["projectId", "createdAt"],
          "companies": ["userId", "email"],
          "translators": ["userId", "email"]
        };

        if (indexMap[col.id]) {
          for (const key of indexMap[col.id]) {
            console.log(`Creating index for ${col.id}: ${key}...`);
            try {
              await databases.createIndex(dbId, col.id, `idx_${key}`, DatabasesIndexType.Key, [key]);
              await new Promise(r => setTimeout(r, 1000));
            } catch (err) {}
          }
        }
      }
    }

    console.log("Checking Storage Bucket...");
    try {
      await storage.getBucket("tranzlo_assets");
    } catch (e) {
      await storage.createBucket("tranzlo_assets", "Tranzlo Assets", ["read()"], true);
    }

    console.log("Appwrite Environment Provisioned Successfully!");
  } catch (error) {
    console.error("Error setting up Appwrite:", error);
  }
}

setup();
