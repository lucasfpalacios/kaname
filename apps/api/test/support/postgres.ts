import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.js";

// Cliente para preparar y limpiar datos en los e2e (la app usa el suyo, PrismaService).
export function testPrisma() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
  afterAll(() => prisma.$disconnect());
  return prisma;
}
