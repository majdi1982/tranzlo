import { Client, Databases } from "node-appwrite";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)
  .setKey(process.env.APPWRITE_API_KEY as string);

const db = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;

async function run() {
  try {
    await db.createStringAttribute(
      DB_ID,
      "applications",
      "testReviewedFileUrl",
      512,
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
