import { Client, Databases } from "node-appwrite";
import fs from "fs";

function getEnv(key: string) {
    const data = fs.readFileSync(".env.local", "utf-8");
    for (const line of data.split("\\n")) {
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
    await db.createStringAttribute(
      DB_ID,
      "applications",
      "testReviewedFileUrl",
      1000,
      false
    );
    console.log("Successfully added testReviewedFileUrl attribute");
  } catch (err: any) {
    if (err.code === 409) {
      console.log("Attribute already exists.");
    } else {
      console.error("Error:", err.message);
    }
  }
}

run();
