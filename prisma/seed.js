const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
