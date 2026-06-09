import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { google } from "googleapis";

// Load .env.local if available
let envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(process.cwd(), "frontend", ".env.local");
}
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      const eq = t.indexOf("=");
      if (eq > 0) {
        let v = t.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        const k = t.slice(0, eq).trim();
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
}


const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH || path.resolve(process.cwd(), "google-service-account.json");

async function runBackup() {
  console.log("=========================================");
  console.log("🚀 STARTING AUTOMATED VPS BACKUP ROUTINE");
  console.log("=========================================");

  if (!FOLDER_ID) {
    console.error("❌ GOOGLE_DRIVE_FOLDER_ID is not configured in environment variables.");
    process.exit(1);
  }

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`❌ Google Service Account key not found at path: ${CREDENTIALS_PATH}`);
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tempDir = path.resolve(process.cwd(), "tmp_backup");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const dbDumpPath = path.resolve(tempDir, "listmonk_db.sql");
  const archivePath = path.resolve(tempDir, `tranzlo_backup_${timestamp}.tar.gz`);

  try {
    // 1. Dump Listmonk Postgres Database from Docker Container
    console.log("📦 Dumping Listmonk database from PostgreSQL container...");
    try {
      execSync(`docker exec tranzlo-listmonk-db pg_dump -U listmonk listmonk > "${dbDumpPath}"`, { stdio: "inherit" });
      console.log("   ✅ Database dump completed.");
    } catch (dbErr: any) {
      console.warn("   ⚠️ PostgreSQL dump warning (likely running locally or container offline). Skipping DB backup:", dbErr.message);
    }

    // 2. Compress project files and DB dump
    console.log("🗜️ Archiving project files...");
    const excludeFlags = [
      '--exclude="node_modules"',
      '--exclude=".next"',
      '--exclude=".git"',
      '--exclude="tmp_backup"',
      '--exclude="deployment.tar.gz"',
    ].join(" ");

    // Using tar (standard on Linux VPS, also available on modern Windows)
    const projectDir = process.cwd();
    const tarCmd = `tar -czf "${archivePath}" ${excludeFlags} -C "${projectDir}" .`;
    execSync(tarCmd, { stdio: "inherit" });
    console.log(`   ✅ Archive created successfully at: ${archivePath}`);

    // 3. Authenticate with Google Drive API
    console.log("🔑 Authenticating with Google Drive Service Account...");
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const drive = google.drive({ version: "v3", auth });
    console.log("   ✅ Google Drive API client authorized.");

    // 4. Upload Backup to Google Drive Folder
    console.log(`📤 Uploading backup archive to Google Drive folder: ${FOLDER_ID}...`);
    const fileMetadata = {
      name: `tranzlo_backup_${timestamp}.tar.gz`,
      parents: [FOLDER_ID],
    };
    const media = {
      mimeType: "application/gzip",
      body: fs.createReadStream(archivePath),
    };

    const uploadResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, size",
    });

    console.log(`   ✅ SUCCESS: Backup uploaded successfully! File ID: ${uploadResponse.data.id} (${uploadResponse.data.size} bytes)`);

    // 5. Clean up old backups (Keep only the 3 latest copies)
    console.log("🧹 Auditing remote backup files to maintain the latest 3 copies...");
    const listResponse = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      orderBy: "createdTime desc",
      fields: "files(id, name, createdTime)",
    });

    const files = listResponse.data.files || [];
    console.log(`   Found ${files.length} existing backup file(s) in Drive.`);

    if (files.length > 3) {
      const filesToDelete = files.slice(3);
      console.log(`   Deleting ${filesToDelete.length} older backup(s)...`);
      for (const oldFile of filesToDelete) {
        if (oldFile.id) {
          await drive.files.delete({ fileId: oldFile.id });
          console.log(`      🗑️ Deleted: ${oldFile.name} (ID: ${oldFile.id})`);
        }
      }
      console.log("   ✅ Older backups cleaned.");
    } else {
      console.log("   ✅ Retention limit not exceeded. No clean up necessary.");
    }

  } catch (err: any) {
    console.error("❌ Backup routine failed with error:", err.message);
    process.exit(1);
  } finally {
    // 6. Clean up temporary files
    console.log("🧹 Cleaning up local temporary backup directory...");
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      console.log("   ✅ Local cleanup finished.");
    } catch (cleanupErr: any) {
      console.warn("   ⚠️ Local temporary file cleanup warning:", cleanupErr.message);
    }
  }
}

runBackup();
