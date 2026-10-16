import { randomUUID } from "node:crypto";
import {
  Prisma,
  type Session,
  type User,
} from "../../src/generated/prisma/client.js";

// Prisma en memoria con solo lo que usa AuthService. Sirve para correr el flujo de auth completo
// (HTTP, cookies, guards, rate limit) en `pnpm test`, sin base de datos. La misma suite corre
// contra Postgres en test/auth.e2e-spec.ts.

type Where<T> = Partial<T>;

const matches = <T extends object>(row: T, where: Where<T>) =>
  Object.entries(where).every(([key, value]) => row[key as keyof T] === value);

export class FakePrisma {
  users: User[] = [];
  sessions: Session[] = [];

  user = {
    create: async ({
      data,
    }: {
      data: Partial<User> & Pick<User, "email" | "name">;
    }) => {
      if (this.users.some((user) => user.email === data.email)) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Unique constraint failed",
          {
            code: "P2002",
            clientVersion: "fake",
          },
        );
      }
      return this.addUser({ passwordHash: null, ...data });
    },
    findUnique: async ({ where }: { where: Where<User> }) =>
      this.users.find((user) => matches(user, where)) ?? null,
    update: async ({
      where,
      data,
    }: {
      where: Where<User>;
      data: Partial<User>;
    }) => {
      const user = this.users.find((row) => matches(row, where));
      if (!user) throw new Error("user not found");
      Object.assign(user, data, { updatedAt: new Date() });
      return user;
    },
  };

  session = {
    create: async ({
      data,
    }: {
      data: Pick<Session, "userId" | "refreshTokenHash" | "expiresAt"> &
        Partial<Session>;
    }) => {
      const session: Session = {
        id: randomUUID(),
        createdAt: new Date(),
        previousTokenHash: null,
        rotatedAt: null,
        ...data,
        userAgent: data.userAgent ?? null,
      };
      this.sessions.push(session);
      return session;
    },
    findUnique: async ({ where }: { where: Where<Session> }) =>
      this.sessions.find((session) => matches(session, where)) ?? null,
    updateMany: async ({
      where,
      data,
    }: {
      where: Where<Session>;
      data: Partial<Session>;
    }) => {
      const rows = this.sessions.filter((session) => matches(session, where));
      rows.forEach((row) => Object.assign(row, data));
      return { count: rows.length };
    },
    deleteMany: async ({ where }: { where: Where<Session> }) => {
      const before = this.sessions.length;
      this.sessions = this.sessions.filter(
        (session) => !matches(session, where),
      );
      return { count: before - this.sessions.length };
    },
    count: async ({ where }: { where: Where<Session> }) =>
      this.sessions.filter((session) => matches(session, where)).length,
  };

  addUser(data: Pick<User, "email" | "passwordHash"> & Partial<User>): User {
    const now = new Date();
    const user: User = {
      id: randomUUID(),
      name: "Usuario de prueba",
      avatarUrl: null,
      isSuperadmin: false,
      locale: "es",
      theme: "SYSTEM",
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    this.users.push(user);
    return user;
  }
}
