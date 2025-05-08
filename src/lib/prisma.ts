// Prisma client setup for Next.js apps.
// This file ensures a single PrismaClient instance is used across hot reloads in development.
// In production, a new client is created per serverless function (safe for serverless).
import { PrismaClient } from '@prisma/client'

// Use a global variable to avoid creating multiple PrismaClient instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Only set the global in development (not in production/serverless)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma