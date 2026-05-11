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
      console.log("Database 'main' already exists.");
    } catch (e) {
      console.log("Creating Database...");
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
        id: "translators",
        name: "Translators Profiles",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "name", type: "string", size: 255, required: true },
          { name: "email", type: "string", size: 255, required: true },
          { name: "languages", type: "string", size: 255, required: true, array: true },
          { name: "country", type: "string", size: 100, required: true },
          { name: "avatarUrl", type: "string", size: 500, required: false },
          { name: "bio", type: "string", size: 5000, required: false },
          { name: "hourlyRate", type: "integer", required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "companies",
        name: "Companies Profiles",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "companyName", type: "string", size: 255, required: true },
          { name: "contactName", type: "string", size: 255, required: true },
          { name: "email", type: "string", size: 255, required: true },
          { name: "country", type: "string", size: 100, required: true },
          { name: "industry", type: "string", size: 255, required: false },
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
          { name: "budget", type: "integer", required: true },
          { name: "ownerId", type: "string", size: 255, required: true },
          { name: "hiredTranslatorId", type: "string", size: 255, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "bids",
        name: "Bids",
        attributes: [
          { name: "projectId", type: "string", size: 255, required: true },
          { name: "translatorId", type: "string", size: 255, required: true },
          { name: "proposal", type: "string", size: 5000, required: true },
          { name: "amount", type: "integer", required: true },
          { name: "status", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "admins",
        name: "Admin Profiles",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "name", type: "string", size: 255, required: true },
          { name: "level", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "employees",
        name: "Employee Profiles",
        attributes: [
          { name: "userId", type: "string", size: 255, required: true },
          { name: "name", type: "string", size: 255, required: true },
          { name: "position", type: "string", size: 255, required: true },
          { name: "department", type: "string", size: 255, required: false },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "chat_rooms",
        name: "Chat Rooms",
        attributes: [
          { name: "projectId", type: "string", size: 255, required: true },
          { name: "participants", type: "string", size: 255, required: true, array: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      },
      {
        id: "messages",
        name: "Messages",
        attributes: [
          { name: "roomId", type: "string", size: 255, required: true },
          { name: "senderId", type: "string", size: 255, required: true },
          { name: "text", type: "string", size: 5000, required: true },
          { name: "type", type: "string", size: 50, required: true },
          { name: "createdAt", type: "string", size: 100, required: true }
        ]
      }
    ];

    for (const col of schema) {
      console.log(`Ensuring Collection: ${col.name} (${col.id})...`);
      try {
        await databases.getCollection(dbId, col.id);
        // Update permissions for existing collection
        await databases.updateCollection(dbId, col.id, col.name, commonPermissions);
        console.log(`Collection '${col.id}' updated with permissions.`);
      } catch (e) {
        console.log(`Creating Collection: ${col.name}...`);
        await databases.createCollection(dbId, col.id, col.name, commonPermissions);
        
        for (const attr of col.attributes) {
          console.log(`  - Adding Attribute: ${attr.name}...`);
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
      console.log("Bucket 'tranzlo_assets' already exists.");
    } catch (e) {
      console.log("Creating Storage Bucket...");
      await storage.createBucket("tranzlo_assets", "Tranzlo Assets", []);
    }

    console.log("Appwrite Environment Provisioned Successfully!");
  } catch (error: any) {
    console.error("Setup Failed:", error.message);
  }
}

setup();
