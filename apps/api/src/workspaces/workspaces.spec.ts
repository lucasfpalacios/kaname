import { workspaceAccessTests } from "../../test/support/workspace-access-flow.js";
import { createTestApp } from "../../test/support/create-app.js";
import { FakePrisma } from "../../test/support/fake-prisma.js";
import { PermissionRoutesModule } from "../../test/support/permission-routes.js";
import {
  buildMemberships,
  FIXTURE_PASSWORD,
  memoryFixtureIds,
} from "../../test/support/workspace-fixture.js";
import { hashPassword } from "../auth/password.js";
import type { Membership } from "./membership.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";

// Aislamiento entre cuentas y permisos por rol con todo en memoria: los guards globales, las
// rutas y el login reales; el repositorio de acceso, un doble con el mismo escenario que el e2e.
class MemoryWorkspaceAccess {
  constructor(private readonly byUser: Map<string, Membership[]>) {}

  async findMembership(userId: string, workspaceId: string) {
    return (
      this.byUser
        .get(userId)
        ?.find(
          (membership) =>
            membership.workspace.id === workspaceId &&
            membership.workspace.archivedAt === null,
        ) ?? null
    );
  }

  async listMemberships(userId: string) {
    return (this.byUser.get(userId) ?? []).filter(
      (membership) => membership.workspace.archivedAt === null,
    );
  }
}

workspaceAccessTests("Permisos por espacio (en memoria)", () => ({
  setup: async () => {
    const ids = memoryFixtureIds();
    const prisma = new FakePrisma();
    const passwordHash = await hashPassword(FIXTURE_PASSWORD);
    for (const [user, { id, email }] of Object.entries(ids.users)) {
      prisma.addUser({
        id,
        email,
        passwordHash,
        isSuperadmin: user === "outsider",
      });
    }
    const app = await createTestApp(prisma, {
      imports: [PermissionRoutesModule],
      overrides: [
        {
          provide: WorkspaceAccessRepository,
          useValue: new MemoryWorkspaceAccess(buildMemberships(ids)),
        },
      ],
    });
    return { app, ids, cleanup: async () => undefined };
  },
}));
