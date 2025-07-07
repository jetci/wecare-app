// __mocks__/prisma.ts

// (Cleared manual Prisma mock, using automatic Jest mock in __mocks__/@prisma/client.ts)

import { PrismaClient } from '@prisma/client';

// สร้าง PrismaClient instance โดยไม่เชื่อมต่อจริง
const prisma = new PrismaClient();
prisma.$connect = jest.fn().mockResolvedValue(undefined);
prisma.$disconnect = jest.fn().mockResolvedValue(undefined);

// mock user.findUnique สำหรับการทดสอบ
(prisma as any).user = {
  findUnique: jest.fn(async ({ where }: { where: { nationalId: string } }) => {
    if (where.nationalId === '1234567890123') {
      return {
        id: '1',
        nationalId: '1234567890123',
        password: 'password', // plain-text เพื่อให้ compare() ผ่าน
        prefix: null,
        firstName: 'Foo',
        lastName: 'Bar',
        phone: null,
        role: 'COMMUNITY',
        approved: true,
      };
    }
    return null;
  }),
} as any;

export default prisma;