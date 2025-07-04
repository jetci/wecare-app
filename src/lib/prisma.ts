import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
