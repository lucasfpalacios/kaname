import { randomUUID } from "node:crypto";
import { hashPassword } from "../../src/auth/password.js";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import type { AuthFlowContext } from "./auth-flow.js";
import { GoogleOAuthClient } from "../../src/auth/google/google-oauth.client.js";
import { MailService } from "../../src/mail/mail.service.js";
import { FakeGoogle } from "./fake-google.js";
import { MailRecorder } from "./mail-recorder.js";
import { createTestApp } from "./create-app.js";
import { FakePrisma } from "./fake-prisma.js";

const secondsAgo = (seconds: number) => new Date(Date.now() - seconds * 1000);

/** Dobles de cada contexto: los emails quedan en `ctx.mail` y Google es `ctx.google`. */
const doubles = (mail: MailRecorder, google: FakeGoogle) => ({
  overrides: [
    { provide: MailService, useValue: mail },
    { provide: GoogleOAuthClient, useValue: google },
  ],
});

export type TestContext = AuthFlowContext & {
  mail: MailRecorder;
  google: FakeGoogle;
  /** Cuentas de Google vinculadas al usuario (sus `sub`). */
  googleSubjects: (email: string) => Promise<string[]>;
  /** Si existe un usuario con ese email. */
  userExists: (email: string) => Promise<boolean>;
};

/** Contexto sin base: Prisma en memoria (corre en `pnpm test`). */
export function fakeContext(): TestContext {
  const prisma = new FakePrisma();
  const mail = new MailRecorder();
  const google = new FakeGoogle();
  return {
    mail,
    google,
    createApp: () => createTestApp(prisma, doubles(mail, google)),
    googleSubjects: async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      return prisma.oauthAccounts
        .filter((account) => account.userId === user?.id)
        .map((account) => account.providerUserId);
    },
    userExists: async (email) =>
      (await prisma.user.findUnique({ where: { email } })) !== null,
    createUser: async (password, locale = "es") => {
      const email = `usuario-${randomUUID()}@kaname.test`;
      prisma.addUser({
        email,
        locale,
        passwordHash: await hashPassword(password),
      });
      return email;
    },
    expireResetTokens: async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      for (const token of prisma.resetTokens) {
        if (token.userId === user?.id) token.expiresAt = secondsAgo(1);
      }
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
export function postgresContext(prisma: PrismaClient): TestContext {
  const emails: string[] = [];
  const mail = new MailRecorder();
  const google = new FakeGoogle();
  return {
    mail,
    google,
    createApp: () => createTestApp(undefined, doubles(mail, google)),
    googleSubjects: async (email) => {
      const accounts = await prisma.oAuthAccount.findMany({
        where: { provider: "google", user: { email } },
      });
      return accounts.map((account) => account.providerUserId);
    },
    userExists: async (email) =>
      (await prisma.user.count({ where: { email } })) > 0,
    createUser: async (password, locale = "es") => {
      const email = `e2e-${randomUUID()}@kaname.test`;
      emails.push(email);
      await prisma.user.create({
        data: {
          email,
          name: "Usuario e2e",
          locale,
          passwordHash: await hashPassword(password),
        },
      });
      return email;
    },
    expireResetTokens: async (email) => {
      await prisma.passwordResetToken.updateMany({
        where: { user: { email } },
        data: { expiresAt: secondsAgo(1) },
      });
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
      // Las sesiones y las cuentas de Google caen en cascada.
      await prisma.user.deleteMany({ where: { email: { in: emails } } });
    },
  };
}
