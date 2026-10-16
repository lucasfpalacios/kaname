import { randomUUID } from "node:crypto";
import { hashPassword } from "../../src/auth/password.js";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import type { AuthFlowContext } from "./auth-flow.js";
import { createTestApp } from "./create-app.js";
import { FakePrisma } from "./fake-prisma.js";

const secondsAgo = (seconds: number) => new Date(Date.now() - seconds * 1000);

/** Contexto sin base: Prisma en memoria (corre en `pnpm test`). */
export function fakeContext(): AuthFlowContext {
  const prisma = new FakePrisma();
  return {
    createApp: () => createTestApp(prisma),
    createUser: async (password) => {
      const email = `usuario-${randomUUID()}@kaname.test`;
      prisma.addUser({ email, passwordHash: await hashPassword(password) });
      return email;
    },
    countSessions: async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? prisma.session.count({ where: { userId: user.id } }) : 0;
    },
    ageRotation: async (email, seconds) => {
      const user = await prisma.user.findUnique({ where: { email } });
      for (const session of prisma.sessions) {
        if (session.userId === user?.id && session.rotatedAt) {
          session.rotatedAt = secondsAgo(seconds);
        }
      }
    },
    trackEmail: () => undefined,
    cleanup: async () => undefined,
  };
}

/** Contexto con Postgres real (`pnpm test:e2e`): borra sus usuarios al terminar. */
export function postgresContext(prisma: PrismaClient): AuthFlowContext {
  const emails: string[] = [];
  return {
    createApp: () => createTestApp(),
    createUser: async (password) => {
      const email = `e2e-${randomUUID()}@kaname.test`;
      emails.push(email);
      await prisma.user.create({
        data: {
          email,
          name: "Usuario e2e",
          passwordHash: await hashPassword(password),
        },
      });
      return email;
    },
    countSessions: (email) =>
      prisma.session.count({ where: { user: { email } } }),
    ageRotation: async (email, seconds) => {
      await prisma.session.updateMany({
        where: { user: { email }, rotatedAt: { not: null } },
        data: { rotatedAt: secondsAgo(seconds) },
      });
    },
    trackEmail: (email) => emails.push(email),
    cleanup: async () => {
      // Las sesiones caen en cascada.
      await prisma.user.deleteMany({ where: { email: { in: emails } } });
    },
  };
}
