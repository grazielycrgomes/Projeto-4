import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Livro Físico de Arquitetura', type: 'physical', price: 100.0, weight: 0.5, dimensions: '20x15cm' },
  });
  await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'E-book de TypeScript', type: 'digital', price: 50.0 },
  });
  console.log('Seed concluído: 2 produtos');
}

main().finally(() => prisma.$disconnect());
