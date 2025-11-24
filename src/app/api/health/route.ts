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
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.db = true;
  } catch { }
  try {
    const r = getRedis();
    if (r) {
      await r.ping();
      result.redis = true;
    }
  } catch { }
  logger.info("health", { result });
  const status = result.db && result.redis ? 200 : 503;
  return NextResponse.json(result, { status });
}