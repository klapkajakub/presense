import { PrismaClient } from '@prisma/client'
import { connectDB } from './database'

// Create a global PrismaClient instance
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

// In development, attach to global to prevent multiple instances during hot reloading
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Re-export the MongoDB connection function
export { connectDB }
