import { verifyPassword } from "../src/auth/password.js";
import { seedAdminPassword } from "./seed-admin.js";

const EMAIL = "lucasfpalacios@gmail.com";

function store(passwordHash: string | null) {
  const user = { id: "u1", passwordHash };
  return {
    user: {
      findUnique: async () => user,
      update: async ({ data }: { data: { passwordHash: string } }) => {
        user.passwordHash = data.passwordHash;
        return user;
      },
    },
    current: () => user.passwordHash,
  };
}

describe("seedAdminPassword", () => {
  it("pone la contraseña de SEED_ADMIN_PASSWORD hasheada con argon2id", async () => {
    const prisma = store(null);
    const result = await seedAdminPassword(
      prisma,
      EMAIL,
      "una contraseña segura",
      () => {},
    );
    expect(result).toBe("set");
    expect(prisma.current()).toMatch(/^\$argon2id\$/);
    expect(
      await verifyPassword(prisma.current(), "una contraseña segura"),
    ).toBe(true);
  });

  it("sin la variable no pone contraseña y avisa", async () => {
    const prisma = store(null);
    const log = vi.fn();
    expect(await seedAdminPassword(prisma, EMAIL, undefined, log)).toBe(
      "missing-env",
    );
    expect(prisma.current()).toBeNull();
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("SEED_ADMIN_PASSWORD"),
    );
  });

  it("no pisa una contraseña existente", async () => {
    const prisma = store("$argon2id$existente");
    const log = vi.fn();
    expect(
      await seedAdminPassword(prisma, EMAIL, "otra contraseña segura", log),
    ).toBe("already-set");
    expect(prisma.current()).toBe("$argon2id$existente");
    expect(log).toHaveBeenCalled();
  });

  it("rechaza una contraseña corta", async () => {
    const prisma = store(null);
    expect(await seedAdminPassword(prisma, EMAIL, "corta", () => {})).toBe(
      "too-short",
    );
    expect(prisma.current()).toBeNull();
  });
});
