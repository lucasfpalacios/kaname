import { randomUUID } from "node:crypto";
import { hashPassword } from "../../src/auth/password.js";
import {
  ModuleKey,
  type PrismaClient,
  SystemRoleKey,
} from "../../src/generated/prisma/client.js";
import type {
  Membership,
  ModulePermissions,
} from "../../src/workspaces/membership.js";

// Escenario de los tests de permisos, el mismo en memoria y en Postgres:
// - Cuenta A, espacio "Tienda": Productos y Pedidos activos, Clientes apagado. Miembros: dueño
//   (OWNER), colaborador (COLLABORATOR: no elimina) y cliente (CLIENT: solo lectura). Además un
//   espacio archivado "Vieja" del dueño.
// - Cuenta B, espacio "Otra": su dueño es superadmin de plataforma y no es miembro de "Tienda".
// En las cuentas (AccountMember), el dueño de A y el de B son Dueños; colaborador y cliente son
// miembros de A.

export const FIXTURE_PASSWORD = "contraseña de prueba larga";

export type FixtureUser = "owner" | "collaborator" | "client" | "outsider";

export type FixtureIds = {
  users: Record<FixtureUser, { id: string; email: string }>;
  workspaces: { tienda: string; vieja: string; otra: string };
  accounts: { A: string; B: string };
};

const MATRIX: Record<SystemRoleKey, ModulePermissions> = {
  OWNER: { view: true, create: true, edit: true, delete: true },
  COLLABORATOR: { view: true, create: true, edit: true, delete: false },
  CLIENT: { view: true, create: false, edit: false, delete: false },
};

const ALL_MODULES = Object.values(ModuleKey);

/** Módulos de cada espacio: [módulo, activo]. */
const MODULES = {
  tienda: [
    [ModuleKey.PRODUCTS, true],
    [ModuleKey.ORDERS, true],
    [ModuleKey.CUSTOMERS, false],
  ],
  vieja: [[ModuleKey.PRODUCTS, true]],
  otra: [[ModuleKey.PRODUCTS, true]],
} as const satisfies Record<string, readonly (readonly [ModuleKey, boolean])[]>;

const MEMBERS: Record<keyof typeof MODULES, [FixtureUser, SystemRoleKey][]> = {
  tienda: [
    ["owner", "OWNER"],
    ["collaborator", "COLLABORATOR"],
    ["client", "CLIENT"],
  ],
  vieja: [["owner", "OWNER"]],
  otra: [["outsider", "OWNER"]],
};

const ACCOUNT_OF = { tienda: "A", vieja: "A", otra: "B" } as const;
const NAMES = { tienda: "Tienda", vieja: "Vieja", otra: "Otra" } as const;
const USERS: FixtureUser[] = ["owner", "collaborator", "client", "outsider"];

const ACCOUNT_MEMBERS: [FixtureUser, "A" | "B", "OWNER" | "MEMBER"][] = [
  ["owner", "A", "OWNER"],
  ["collaborator", "A", "MEMBER"],
  ["client", "A", "MEMBER"],
  ["outsider", "B", "OWNER"],
];

const emailOf = (user: FixtureUser, run: string) =>
  `${user}-${run}@kaname.test`;

/** Las membresías del escenario, para el repositorio en memoria de los tests unitarios. */
export function buildMemberships(ids: FixtureIds): Map<string, Membership[]> {
  const byUser = new Map<string, Membership[]>();
  for (const key of Object.keys(MODULES) as (keyof typeof MODULES)[]) {
    for (const [user, roleKey] of MEMBERS[key]) {
      const membership: Membership = {
        workspace: {
          id: ids.workspaces[key],
          accountId: `account-${ACCOUNT_OF[key]}`,
          name: NAMES[key],
          slug: key,
          type: "BUSINESS",
          color: null,
          logoUrl: null,
          baseCurrency: "ARS",
          archivedAt: key === "vieja" ? new Date() : null,
        },
        accountRole: roleKey === "OWNER" ? "OWNER" : "MEMBER",
        role: {
          id: `role-${ACCOUNT_OF[key]}-${roleKey}`,
          systemKey: roleKey,
          name: roleKey,
        },
        modules: MODULES[key]
          .filter(([, enabled]) => enabled)
          .map(([module]) => module),
        permissions: Object.fromEntries(
          ALL_MODULES.map((module) => [module, MATRIX[roleKey]]),
        ),
      };
      const userId = ids.users[user].id;
      byUser.set(userId, [...(byUser.get(userId) ?? []), membership]);
    }
  }
  return byUser;
}

/** Ids para el escenario en memoria. */
export function memoryFixtureIds(): FixtureIds {
  const run = randomUUID().slice(0, 8);
  return {
    users: Object.fromEntries(
      USERS.map((user) => [
        user,
        { id: `user-${user}-${run}`, email: emailOf(user, run) },
      ]),
    ) as FixtureIds["users"],
    workspaces: {
      tienda: `ws-tienda-${run}`,
      vieja: `ws-vieja-${run}`,
      otra: `ws-otra-${run}`,
    },
    accounts: { A: "account-A", B: "account-B" },
  };
}

/** Crea el escenario en Postgres. Devuelve los ids y una función para borrarlo. */
export async function seedWorkspaceFixture(prisma: PrismaClient) {
  const run = randomUUID().slice(0, 8);
  const passwordHash = await hashPassword(FIXTURE_PASSWORD);

  const users = {} as FixtureIds["users"];
  for (const user of USERS) {
    const created = await prisma.user.create({
      data: {
        email: emailOf(user, run),
        name: `Usuario ${user}`,
        passwordHash,
        isSuperadmin: user === "outsider",
      },
    });
    users[user] = { id: created.id, email: created.email };
  }

  const accounts = { A: "", B: "" };
  const roles: Record<string, string> = {};
  for (const account of ["A", "B"] as const) {
    const created = await prisma.account.create({
      data: { name: `Cuenta ${account} ${run}` },
    });
    accounts[account] = created.id;
    for (const roleKey of Object.values(SystemRoleKey)) {
      const role = await prisma.role.create({
        data: {
          accountId: created.id,
          systemKey: roleKey,
          name: roleKey,
          permissions: {
            create: ALL_MODULES.map((module) => ({
              module,
              canView: MATRIX[roleKey].view,
              canCreate: MATRIX[roleKey].create,
              canEdit: MATRIX[roleKey].edit,
              canDelete: MATRIX[roleKey].delete,
            })),
          },
        },
      });
      roles[`${account}-${roleKey}`] = role.id;
    }
  }

  await prisma.accountMember.createMany({
    data: ACCOUNT_MEMBERS.map(([user, account, role]) => ({
      accountId: accounts[account],
      userId: users[user].id,
      role,
    })),
  });

  const workspaces = {} as FixtureIds["workspaces"];
  for (const key of Object.keys(MODULES) as (keyof typeof MODULES)[]) {
    const account = ACCOUNT_OF[key];
    const workspace = await prisma.workspace.create({
      data: {
        accountId: accounts[account],
        name: NAMES[key],
        slug: `${key}-${run}`,
        archivedAt: key === "vieja" ? new Date() : null,
        modules: {
          create: MODULES[key].map(([module, enabled], sortOrder) => ({
            module,
            enabled,
            sortOrder,
          })),
        },
        members: {
          create: MEMBERS[key].map(([user, roleKey]) => ({
            userId: users[user].id,
            roleId: roles[`${account}-${roleKey}`],
          })),
        },
      },
    });
    workspaces[key] = workspace.id;
  }

  const cleanup = async () => {
    // Primero los espacios (se llevan miembros y módulos en cascada): WorkspaceMember.roleId es
    // RESTRICT, así que las cuentas (y sus roles) recién se pueden borrar después.
    const accountIds = Object.values(accounts);
    await prisma.workspace.deleteMany({
      where: { accountId: { in: accountIds } },
    });
    await prisma.account.deleteMany({ where: { id: { in: accountIds } } });
    await prisma.user.deleteMany({
      where: { id: { in: Object.values(users).map((user) => user.id) } },
    });
  };

  return { ids: { users, workspaces, accounts } satisfies FixtureIds, cleanup };
}
