import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if default area already exists
        const developer = await prisma.user.upsert({
    where: { nationalId: '3500200461028' },
    update: {
      password: bcrypt.hashSync('@Admin123', 10),
      role: 'DEVELOPER',
      position: 'ADMIN',
      approved: true,
    },
    create: {
      nationalId: '3500200461028',
      password: bcrypt.hashSync('@Admin123', 10),
      prefix: 'Mr.',
      firstName: 'Developer',
      lastName: 'Account',
      role: 'DEVELOPER',
      position: 'ADMIN',
      approved: true,
    },
  });
  console.log('Seeded developer account:', developer);

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
