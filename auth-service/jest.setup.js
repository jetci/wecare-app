// jest.setup.js

// Mock PrismaClient ให้ไม่เชื่อมต่อฐานข้อมูลจริง
jest.mock('@prisma/client', () => {
  // ดึงโมดูลจริงมา
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: class {
      constructor() {
        // stub connect/disconnect
        this.$connect = jest.fn().mockResolvedValue(undefined);
        this.$disconnect = jest.fn().mockResolvedValue(undefined);
        // ถ้าต้อง mock models เพิ่ม ก็ใส่ที่นี่
        // ex: this.user = { findUnique: jest.fn(), ... }
      }
    },
  };
});

