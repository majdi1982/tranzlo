import { Client, Databases, ID, Permission, Role } from "node-appwrite";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

const databases = new Databases(client);

async function testCreate() {
    console.log("Testing document creation as 'any'...");
    try {
        const res = await databases.createDocument(
            "main",
            "users",
            ID.unique(),
            {
                name: "Test User",
                email: `test-${Date.now()}@tranzlo.net`,
                role: "translator",
                publicId: `TRZ-${Date.now()}`,
                entityType: "user",
                status: "active",
                visibility: "public",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );
        console.log("Success! Document created:", res.$id);
    } catch (e: any) {
        console.log("Failed to create document:");
        console.log("Message:", e.message);
        console.log("Code:", e.code);
        console.log("Type:", e.type);
    }
}

testCreate();
