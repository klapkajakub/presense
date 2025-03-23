// Custom implementation to avoid WASM dependencies
import { PrismaClient as PrismaClientEdge } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Define the singleton type
type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

// Create a factory function for the Prisma client
function createPrismaClient() {
  return new PrismaClientEdge({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());
}

// Create a global object for storing the prisma instance
const globalForPrisma = global as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export the singleton instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// For development, attach the client to the global object to prevent
// multiple instances during hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} 