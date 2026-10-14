// Datos iniciales: usuario de Lucas, su cuenta, roles del sistema con su matriz de permisos
// y los 4 espacios con sus módulos. Es idempotente: se puede correr varias veces.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AccountRole,
  AccountType,
  ModuleKey,
  PrismaClient,
  WorkspaceType,
} from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Falta DATABASE_URL");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const ALL_MODULES = Object.values(ModuleKey);

type Permission = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

// Roles del sistema: misma matriz para todos los módulos.
const SYSTEM_ROLES: {
  name: string;
  description: string;
  permission: Permission;
}[] = [
  {
    name: "Dueño",
    description: "Acceso total a todos los módulos.",
    permission: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  },
  {
    name: "Colaborador",
    description: "Ve, crea y edita. No puede eliminar.",
    permission: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
  },
  {
    name: "Cliente",
    description: "Solo lectura.",
    permission: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
];

const WORKSPACES: {
  slug: string;
  name: string;
  type: WorkspaceType;
  description: string;
  modules: ModuleKey[];
}[] = [
  {
    slug: "tank-vault-tcg",
    name: "Tank Vault TCG",
    type: WorkspaceType.BUSINESS,
    description: "Cartas coleccionables: venta e importación.",
    modules: [
      ModuleKey.DASHBOARD,
      ModuleKey.PRODUCTS,
      ModuleKey.CUSTOMERS,
      ModuleKey.SUPPLIERS,
      ModuleKey.PRICE_LISTS,
      ModuleKey.CALCULATOR,
      ModuleKey.MARKET_PRICES,
      ModuleKey.ORDERS,
      ModuleKey.PURCHASES,
      ModuleKey.DOCUMENTS,
      ModuleKey.CALENDAR,
      ModuleKey.SOCIAL_METRICS,
    ],
  },
  {
    slug: "disanza",
    name: "Disanza",
    type: WorkspaceType.BUSINESS,
    description: "Gastronomía y takeaway.",
    modules: [
      ModuleKey.DASHBOARD,
      ModuleKey.PRODUCTS,
      ModuleKey.CUSTOMERS,
      ModuleKey.SUPPLIERS,
      ModuleKey.CALCULATOR,
      ModuleKey.MARKET_PRICES,
      ModuleKey.ORDERS,
      ModuleKey.PURCHASES,
      ModuleKey.CALENDAR,
      ModuleKey.SOCIAL_METRICS,
    ],
  },
  {
    slug: "visio",
    name: "VISIÓ",
    type: WorkspaceType.BUSINESS,
    description: "Estudio creativo.",
    modules: [
      ModuleKey.DASHBOARD,
      ModuleKey.PRODUCTS,
      ModuleKey.CUSTOMERS,
      ModuleKey.PROJECTS,
      ModuleKey.QUOTES,
      ModuleKey.DOCUMENTS,
      ModuleKey.CALENDAR,
      ModuleKey.SOCIAL_METRICS,
    ],
  },
  {
    slug: "shinka",
    name: "Shinka",
    type: WorkspaceType.PROJECTS,
    description: "Desarrollo de software para clientes.",
    modules: [
      ModuleKey.DASHBOARD,
      ModuleKey.CUSTOMERS,
      ModuleKey.PROJECTS,
      ModuleKey.QUOTES,
      ModuleKey.DOCUMENTS,
      ModuleKey.CALENDAR,
    ],
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "lucasfpalacios@gmail.com" },
    update: {},
    create: {
      email: "lucasfpalacios@gmail.com",
      name: "Lucas Facundo Palacios",
      isSuperadmin: true,
    },
  });

  // Account no tiene un campo único propio: se reutiliza la cuenta de la que Lucas ya es dueño.
  const existingAccount = await prisma.account.findFirst({
    where: { members: { some: { userId: user.id, role: AccountRole.OWNER } } },
  });
  const account =
    existingAccount ??
    (await prisma.account.create({
      data: {
        name: "Lucas Palacios",
        type: AccountType.PERSONAL,
        members: { create: { userId: user.id, role: AccountRole.OWNER } },
      },
    }));

  const roles = new Map<string, string>();
  for (const role of SYSTEM_ROLES) {
    const saved = await prisma.role.upsert({
      where: { accountId_name: { accountId: account.id, name: role.name } },
      update: { description: role.description, isSystem: true },
      create: {
        accountId: account.id,
        name: role.name,
        description: role.description,
        isSystem: true,
      },
    });
    roles.set(role.name, saved.id);

    for (const module of ALL_MODULES) {
      await prisma.rolePermission.upsert({
        where: { roleId_module: { roleId: saved.id, module } },
        update: role.permission,
        create: { roleId: saved.id, module, ...role.permission },
      });
    }
  }

  const ownerRoleId = roles.get("Dueño")!;

  for (const ws of WORKSPACES) {
    const workspace = await prisma.workspace.upsert({
      where: { accountId_slug: { accountId: account.id, slug: ws.slug } },
      update: { name: ws.name, type: ws.type, description: ws.description },
      create: {
        accountId: account.id,
        slug: ws.slug,
        name: ws.name,
        type: ws.type,
        description: ws.description,
      },
    });

    for (const [sortOrder, module] of ws.modules.entries()) {
      await prisma.workspaceModule.upsert({
        where: { workspaceId_module: { workspaceId: workspace.id, module } },
        update: { enabled: true, sortOrder },
        create: { workspaceId: workspace.id, module, sortOrder },
      });
    }

    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId: workspace.id, userId: user.id },
      },
      update: { roleId: ownerRoleId },
      create: {
        workspaceId: workspace.id,
        userId: user.id,
        roleId: ownerRoleId,
      },
    });
  }

  console.log(
    `Seed listo: ${user.email}, cuenta "${account.name}", ${SYSTEM_ROLES.length} roles, ${WORKSPACES.length} espacios.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
