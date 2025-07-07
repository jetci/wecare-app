import { PrismaClient } from '@prisma/client';

// augment NodeJS global
declare global {
  namespace NodeJS {
    interface Global {
      prisma?: PrismaClient;
    }
  }
}

const globalAny = global as unknown as { prisma?: PrismaClient };
const prisma = globalAny.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalAny.prisma = prisma;
}

export default prisma;
