"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";
import { AuditAction } from "@/types";

export async function logAudit(
  userId: string,
  action: AuditAction,
  targetType: string,
  targetId: string,
  changes?: any
) {
  const { databases } = await createAdminClient();
  const now = new Date().toISOString();

  try {
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.auditLogsCollectionId,
      ID.unique(),
      {
        publicId: `TRZ-LOG-${ID.unique().substring(0, 8).toUpperCase()}`,
        entityType: "auditLog",
        userId,
        action,
        targetType,
        targetId,
        changes: changes ? JSON.stringify(changes) : undefined,
        status: "active",
        visibility: "internal",
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
        metadata: JSON.stringify({}),
      }
    );
  } catch (error: any) {
    console.error("Audit Log Error:", error.message);
  }
}
