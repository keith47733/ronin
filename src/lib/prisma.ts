// Prisma client setup for Next.js apps.
// This file ensures a single PrismaClient instance is used across hot reloads in development.
// In production, a new client is created per serverless function (safe for serverless).
import { PrismaClient } from '../generated/prisma';

// Use a global variable to avoid creating multiple PrismaClient instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

// Only set the global in development (not in production/serverless)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;