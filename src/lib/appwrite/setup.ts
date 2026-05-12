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
  
  try {
    console.log("Checking for existing database...");
    try {
      await databases.get(dbId);
    } catch (e) {
      await databases.create(dbId, "Tranzlo Main Database");
    }

    const globalFields = [
      { name: "publicId", type: "string", size: 50, required: true },
      { name: "entityType", type: "string", size: 50, required: true },
      { name: "updatedAt", type: "string", size: 100, required: true },
      { name: "createdBy", type: "string", size: 255, required: false },
      { name: "updatedBy", type: "string", size: 255, required: false },
      { name: "status", type: "string", size: 50, required: true },
      { name: "visibility", type: "string", size: 50, required: true },
      { name: "metadata", type: "string", size: 5000, required: false },
      { name: "createdAt", type: "string", size: 100, required: true }
    ];

    const collections = [
      { 
        id: "translators", 
        name: "Translators", 
        permissions: [
          Permission.read(Role.any()), 
          Permission.create(Role.any()), 
          Permission.update(Role.users())
        ],
        attrs: [
          { name: "userId", type: "string", size: 255 },
          { name: "name", type: "string", size: 255 },
          { name: "bio", type: "string", size: 2000 },
          { name: "languages", type: "string", size: 255, array: true },
          { name: "skills", type: "string", size: 255, array: true },
          { name: "hourlyRate", type: "float" },
          { name: "portfolioUrl", type: "string", size: 500 },
          { name: "avatarUrl", type: "string", size: 500 }
        ]
      },
      { 
        id: "companies", 
        name: "Companies", 
        permissions: [
          Permission.read(Role.any()), 
          Permission.create(Role.any()), 
          Permission.update(Role.users())
        ],
        attrs: [
          { name: "userId", type: "string", size: 255 },
          { name: "companyName", type: "string", size: 255 },
          { name: "website", type: "string", size: 500 },
          { name: "industry", type: "string", size: 100 },
          { name: "logoUrl", type: "string", size: 500 },
          { name: "taxId", type: "string", size: 100 }
        ]
      },
      { 
        id: "admins", 
        name: "Admins", 
        permissions: [Permission.read(Role.team("admins")), Permission.update(Role.team("admins"))],
        attrs: [
          { name: "userId", type: "string", size: 255 },
          { name: "adminLevel", type: "string", size: 50 },
          { name: "department", type: "string", size: 100 }
        ]
      },
      { 
        id: "wallets", 
        name: "Wallets", 
        permissions: [Permission.read(Role.users()), Permission.update(Role.team("admins"))],
        attrs: [
          { name: "userId", type: "string", size: 255 },
          { name: "balance", type: "float", required: true },
          { name: "currency", type: "string", size: 10, required: true },
          { name: "lastTransactionAt", type: "string", size: 100 }
        ]
      },
      { 
        id: "transactions", 
        name: "Transactions", 
        permissions: [Permission.read(Role.users())],
        attrs: [
          { name: "walletId", type: "string", size: 255 },
          { name: "amount", type: "float", required: true },
          { name: "type", type: "string", size: 50 }, // credit, debit
          { name: "description", type: "string", size: 500 },
          { name: "referenceId", type: "string", size: 255 }
        ]
      },
      { 
        id: "milestones", 
        name: "Milestones", 
        permissions: [Permission.read(Role.users()), Permission.update(Role.users())],
        attrs: [
          { name: "jobId", type: "string", size: 255 },
          { name: "title", type: "string", size: 255 },
          { name: "amount", type: "float" },
          { name: "dueDate", type: "string", size: 100 },
          { name: "releaseStatus", type: "string", size: 50 } // pending, released, disputed
        ]
      },
      { 
        id: "chatRooms", 
        name: "Chat Rooms", 
        permissions: [Permission.read(Role.users())],
        attrs: [
          { name: "jobId", type: "string", size: 255 },
          { name: "participants", type: "string", size: 255, array: true }
        ]
      },
      { 
        id: "messages", 
        name: "Messages", 
        permissions: [Permission.read(Role.users()), Permission.create(Role.users())],
        attrs: [
          { name: "roomId", type: "string", size: 255 },
          { name: "senderId", type: "string", size: 255 },
          { name: "content", type: "string", size: 5000 },
          { name: "type", type: "string", size: 50 } // text, system, file
        ]
      },
      { 
        id: "notifications", 
        name: "Notifications", 
        permissions: [Permission.read(Role.users()), Permission.update(Role.users())],
        attrs: [
          { name: "userId", type: "string", size: 255 },
          { name: "type", type: "string", size: 50 },
          { name: "content", type: "string", size: 1000 },
          { name: "link", type: "string", size: 500 },
          { name: "read", type: "boolean" }
        ]
      },
      { 
        id: "disputes", 
        name: "Disputes", 
        permissions: [Permission.read(Role.users()), Permission.create(Role.users())],
        attrs: [
          { name: "jobId", type: "string", size: 255 },
          { name: "openedBy", type: "string", size: 255 },
          { name: "reason", type: "string", size: 1000 },
          { name: "evidenceUrl", type: "string", size: 500 }
        ]
      },
      { 
        id: "auditLogs", 
        name: "Audit Logs", 
        permissions: [Permission.read(Role.team("admins"))],
        attrs: [
          { name: "userId", type: "string", size: 255 },
          { name: "action", type: "string", size: 50 },
          { name: "targetType", type: "string", size: 50 },
          { name: "targetId", type: "string", size: 255 },
          { name: "changes", type: "string", size: 5000 }
        ]
      },
      { 
        id: "jobs", 
        name: "Jobs", 
        permissions: [Permission.read(Role.any()), Permission.create(Role.users())],
        attrs: [
          { name: "companyId", type: "string", size: 255 },
          { name: "title", type: "string", size: 255 },
          { name: "description", type: "string", size: 5000 },
          { name: "sourceLanguage", type: "string", size: 100 },
          { name: "targetLanguage", type: "string", size: 100 },
          { name: "budget", type: "float" },
          { name: "deadline", type: "string", size: 100 },
          { name: "jobType", type: "string", size: 50 },
          { name: "isInviteOnly", type: "boolean" },
          { name: "hiredTranslatorId", type: "string", size: 255 },
          { name: "applicationCount", type: "integer" },
          { name: "viewCount", type: "integer" },
          { name: "milestones", type: "string", size: 5000 }
        ]
      },
      { 
        id: "users", 
        name: "Users", 
        permissions: [
          Permission.read(Role.any()), 
          Permission.create(Role.any()), 
          Permission.update(Role.users())
        ],
        attrs: [
          { name: "userId", type: "string", size: 255 },
          { name: "role", type: "string", size: 50 },
          { name: "onboarded", type: "boolean" }
        ]
      },
      { 
        id: "jobApplications", 
        name: "Job Applications", 
        permissions: [
          Permission.read(Role.any()), 
          Permission.create(Role.any()), 
          Permission.update(Role.users())
        ],
        attrs: [
          { name: "jobId", type: "string", size: 255 },
          { name: "translatorId", type: "string", size: 255 },
          { name: "proposalText", type: "string", size: 5000 },
          { name: "price", type: "float" },
          { name: "deliveryTime", type: "string", size: 100 }
        ]
      }
    ];

    for (const col of collections) {
      console.log(`Ensuring Collection: ${col.name}...`);
      try {
        await databases.getCollection(dbId, col.id);
        await databases.updateCollection(dbId, col.id, col.name, col.permissions);
      } catch (e) {
        await databases.createCollection(dbId, col.id, col.name, col.permissions);
      }

      const allAttrs = [...col.attrs, ...globalFields];
      for (const attr of allAttrs) {
        try {
          if (attr.type === "string") {
            await databases.createStringAttribute(dbId, col.id, attr.name, (attr as any).size || 255, (attr as any).required || false, undefined, (attr as any).array);
          } else if (attr.type === "integer") {
            await databases.createIntegerAttribute(dbId, col.id, attr.name, (attr as any).required || false);
          } else if (attr.type === "float") {
            await databases.createFloatAttribute(dbId, col.id, attr.name, (attr as any).required || false);
          } else if (attr.type === "boolean") {
            await databases.createBooleanAttribute(dbId, col.id, attr.name, (attr as any).required || false);
          }
          await new Promise(r => setTimeout(r, 400));
        } catch (attrErr) {}
      }
    }

    console.log("Enterprise Ecosystem Updated Successfully!");
  } catch (error) {
    console.error("Setup Error:", error);
  }
}

setup();
