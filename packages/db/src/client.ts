import { PrismaClient } from "@prisma/client";

// Reuse a single client across hot-reloads / imports to avoid exhausting
// connections during development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient } from "@prisma/client";
export type { TrackedPlayer, Snapshot, Prisma } from "@prisma/client";
