import { Client, Databases } from "node-appwrite";
import fs from "fs";

function getEnv(key: string) {
    const data = fs.readFileSync(".env.local", "utf-8");
    for (const line of data.split("\n")) {
        if (line.startsWith(key + "=")) {
            return line.split("=")[1].trim();
        }
    }
    return "";
}

const client = new Client()
  .setEndpoint(getEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT"))
  .setProject(getEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID"))
  .setKey(getEnv("APPWRITE_API_KEY"));

const db = new Databases(client);
const DB_ID = getEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ID");

async function run() {
  try {
    console.log("Adding reminderSent to messages collection...");
    await db.createBooleanAttribute(
      DB_ID,
      "messages", // collectionId
      "reminderSent", // key
      false, // required
      false, // default
      false // array
    );
    console.log("✅ Attribute reminderSent added successfully!");
  } catch (error: any) {
    console.error("❌ Error adding attribute:", error.message);
  }
}

run();
