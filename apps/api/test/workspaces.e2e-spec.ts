import { createTestApp } from "./support/create-app.js";
import { PermissionRoutesModule } from "./support/permission-routes.js";
import { testPrisma } from "./support/postgres.js";
import { workspaceAccessTests } from "./support/workspace-access-flow.js";
import { seedWorkspaceFixture } from "./support/workspace-fixture.js";

// El mismo aislamiento que src/workspaces/workspaces.spec.ts, contra Postgres (kaname_test): acá
// corre la consulta real de WorkspaceAccessRepository.
const prisma = testPrisma();

workspaceAccessTests("Permisos por espacio (Postgres)", () => ({
  setup: async () => {
    const { ids, cleanup } = await seedWorkspaceFixture(prisma);
    const app = await createTestApp(undefined, {
      imports: [PermissionRoutesModule],
    });
    return { app, ids, cleanup };
  },
}));
