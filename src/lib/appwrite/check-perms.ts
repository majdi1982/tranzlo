import { Client, Databases } from "node-appwrite";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

const databases = new Databases(client);

async function checkPermissions() {
    const dbId = "main";
    const collectionIds = ["translators", "companies", "users"];
    
    for (const id of collectionIds) {
        try {
            const col = await databases.getCollection(dbId, id);
            console.log(`Collection: ${id}`);
            console.log(`Permissions:`, JSON.stringify(col.permissions, null, 2));
            console.log(`Document Security:`, col.documentSecurity);
            console.log("-------------------");
        } catch (e) {
            console.log(`Error getting collection ${id}:`, e);
        }
    }
}

checkPermissions();
