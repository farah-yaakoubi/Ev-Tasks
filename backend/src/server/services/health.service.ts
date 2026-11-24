import { prisma } from '../prisma.js';

export async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
