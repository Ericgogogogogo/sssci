import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

console.log("DATABASE_URL in client.ts:", process.env.DATABASE_URL ? "exists" : "missing");
console.log("DATABASE_URL prefix:", process.env.DATABASE_URL?.substring(0, 20));

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ 
    adapter, 
    log: ["error", "warn", "info"],
    errorFormat: "pretty"
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;