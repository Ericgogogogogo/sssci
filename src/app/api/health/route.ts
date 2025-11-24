import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getRedis } from "@/lib/redis/client";
import { logger } from "@/lib/logging/logger";

interface HealthCheckResult {
  app: boolean;
  db: boolean;
  redis: boolean;
}

export async function GET() {
  const result: HealthCheckResult = { app: true, db: false, redis: false };
  let dbError = null;
  let redisError = null;
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.db = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }
  
  try {
    const r = getRedis();
    if (r) {
      await r.ping();
      result.redis = true;
    }
  } catch (e) {
    redisError = e instanceof Error ? e.message : String(e);
  }
  
  logger.info("health", { result, dbError, redisError });
  const status = result.db && result.redis ? 200 : 503;
  return NextResponse.json({ ...result, dbError, redisError }, { status });
}