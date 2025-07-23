import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed test user matching session.userId to satisfy FK constraint
  const sessionUserId = 'clwkbx1230000v7p4gh5i9jk';
  await prisma.user.upsert({
    where: { id: sessionUserId },
    update: {},
    create: {
      id: sessionUserId,
      prefix: 'นาย',
      firstName: 'Test',
      lastName: 'User',
      nationalId: '0000000000001',
      password: 'password123',
      role: 'COMMUNITY',
      position: 'COMMUNITY',
      approved: true,
    },
  });
  // Check if default area already exists
  const exists = await prisma.area.findFirst({
    where: {
      province: 'เชียงใหม่',
      district: 'ฝาง',
      subdistrict: 'เวียง',
    },
  });

  if (!exists) {
    const area = await prisma.area.create({
      data: {
        province: 'เชียงใหม่',
        district: 'ฝาง',
        subdistrict: 'เวียง',
        active: true,
      },
    });
    console.log('Seeded default area:', area);
  } else {
    console.log('Default area already exists, skipping');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
