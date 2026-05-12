import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl);

export async function generateTrzId(type: "JOB" | "INV" | "USER" | "APP" | "CMP" | "TRN" | "PRJ" = "JOB"): Promise<string> {
  const counterKey = `trz_${type.toLowerCase()}_counter`;
  const count = await redis.incr(counterKey);
  const paddedCount = String(count).padStart(6, "0");
  return `TRZ-${type}-${paddedCount}`;
}
