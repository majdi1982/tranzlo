import { Client, Databases, Storage, ID, Permission, Role } from "node-appwrite";
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
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "projects",
        name: "Projects",
        attributes: [
          { name: "title", type: "string", size: 255, required: true },
          { name: "description", type: "string", size: 5000, required: true },
          { name: "status", type: "string", size: 50, required: true },
          { name: "ownerId", type: "string", size: 255, required: true },
          { name: "hiredTranslatorId", type: "string", size: 255, required: false },
          { name: "invitedTranslatorId", type: "string", size: 255, required: false },
          { name: "acceptedBidId", type: "string", size: 255, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "companies",
        name: "Companies",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "companyName", type: "string", size: 255, required: true },
          { name: "verificationStatus", type: "string", size: 50, required: false },
          { name: "taxId", type: "string", size: 100, required: false },
          { name: "registrationNumber", type: "string", size: 100, required: false }
        ]
      }
    ];
      {
        id: "bids",
        name: "Bids",
        attributes: [
          { name: "projectId", type: "string", size: 255, required: true },
          { name: "translatorId", type: "string", size: 255, required: true },
          { name: "proposal", type: "string", size: 5000, required: true },
          { name: "amount", type: "integer", required: true },
          { name: "deliveryTime", type: "string", size: 100, required: false },
          { name: "status", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "tickets",
        name: "Support Tickets",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "subject", type: "string", size: 255, required: true },
          { name: "description", type: "string", size: 5000, required: true },
          { name: "status", type: "string", size: 50, required: true },
          { name: "priority", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "posts",
        name: "Community Posts",
        attributes: [
          { name: "authorId", type: "string", size: 255, required: true },
          { name: "title", type: "string", size: 255, required: true },
          { name: "content", type: "string", size: 5000, required: true },
          { name: "tags", type: "string", size: 255, required: false, array: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "comments",
        name: "Comments",
        attributes: [
          { name: "parentId", type: "string", size: 255, required: true }, // Post or Blog ID
          { name: "authorId", type: "string", size: 255, required: true },
          { name: "content", type: "string", size: 2000, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "teams",
        name: "Teams",
        attributes: [
          { name: "name", type: "string", size: 255, required: true },
          { name: "ownerId", type: "string", size: 255, required: true },
          { name: "description", type: "string", size: 500, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "notifications",
        name: "Notifications",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "title", type: "string", size: 255, required: true },
          { name: "message", type: "string", size: 1000, required: true },
          { name: "type", type: "string", size: 50, required: true },
          { name: "link", type: "string", size: 500, required: false },
          { name: "read", type: "boolean", required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "disputes",
        name: "Disputes",
        attributes: [
          { name: "projectId", type: "string", size: 255, required: true },
          { name: "complainantId", type: "string", size: 255, required: true },
          { name: "reason", type: "string", size: 2000, required: true },
          { name: "status", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "ratings",
        name: "Ratings",
        attributes: [
          { name: "projectId", type: "string", size: 255, required: true },
          { name: "fromId", type: "string", size: 255, required: true },
          { name: "toId", type: "string", size: 255, required: true },
          { name: "score", type: "integer", required: true },
          { name: "comment", type: "string", size: 1000, required: false },
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
          }
          await new Promise(r => setTimeout(r, 500));
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
