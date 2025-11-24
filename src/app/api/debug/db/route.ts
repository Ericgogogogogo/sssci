import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const debug = {
    databaseUrl: process.env.DATABASE_URL ? "exists" : "missing",
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30),
    connectionTest: false,
    error: null as string | null,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    debug.connectionTest = true;
  } catch (e) {
    debug.error = e instanceof Error ? e.message : String(e);
    console.error("Database connection test failed:", e);
  }

  return NextResponse.json(debug);
}