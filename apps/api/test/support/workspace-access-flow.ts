import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import { ACCESS_COOKIE } from "../../src/auth/cookies.js";
import { cookieHeader, cookiesOf } from "./auth-flow.js";
import {
  FIXTURE_PASSWORD,
  type FixtureIds,
  type FixtureUser,
} from "./workspace-fixture.js";
import { fromIp } from "./client-ip.js";

// Aislamiento entre cuentas y permisos por rol, por HTTP. Compartido entre la versión en memoria
// (src/workspaces/workspaces.spec.ts) y la de Postgres (test/workspaces.e2e-spec.ts).

export type WorkspaceAccessContext = {
  /** Crea el escenario y la app; devuelve los ids y la limpieza. */
  setup: () => Promise<{
    app: INestApplication<App>;
    ids: FixtureIds;
    cleanup: () => Promise<void>;
  }>;
};

export function workspaceAccessTests(
  name: string,
  context: () => WorkspaceAccessContext,
) {
  describe(name, () => {
    let app: INestApplication<App>;
    let ids: FixtureIds;
    let cleanup: () => Promise<void>;
    const access = new Map<FixtureUser, string>();

    beforeAll(async () => {
      ({ app, ids, cleanup } = await context().setup());
      // Un login por usuario, cada uno desde otra IP (por el proxy de Next) para no
      // tocar el rate limit por IP.
      for (const [index, user] of (
        ["owner", "collaborator", "client", "outsider"] as const
      ).entries()) {
        const response = await request(app.getHttpServer())
          .post("/api/auth/login")
          .set(fromIp(`192.0.2.${index + 1}`))
          .send({ email: ids.users[user].email, password: FIXTURE_PASSWORD });
        expect(response.status).toBe(200);
        access.set(user, cookiesOf(response).get(ACCESS_COOKIE)!.value);
      }
    });

    afterAll(async () => {
      await app.close();
      await cleanup();
    });

    const as = (user: FixtureUser | null) => {
      const http = request(app.getHttpServer());
      const auth = (call: request.Test) =>
        user
          ? call.set(
              "Cookie",
              cookieHeader({ [ACCESS_COOKIE]: access.get(user)! }),
            )
          : call;
      return {
        get: (path: string) => auth(http.get(path)),
        post: (path: string) => auth(http.post(path)),
        patch: (path: string) => auth(http.patch(path)),
        delete: (path: string) => auth(http.delete(path)),
      };
    };

    const products = () =>
      `/api/workspaces/${ids.workspaces.tienda}/test-products`;

    it("GET /api/workspaces: mis espacios con mi rol y los módulos activos, sin archivados", async () => {
      const response = await as("owner").get("/api/workspaces");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: ids.workspaces.tienda,
        name: "Tienda",
        role: { systemKey: "OWNER" },
        modules: ["PRODUCTS", "ORDERS"],
      });
      expect(response.body[0].permissions.PRODUCTS).toEqual({
        view: true,
        create: true,
        edit: true,
        delete: true,
      });
    });

    it("GET /api/workspaces/:workspaceId: el espacio con el rol del miembro", async () => {
      const response = await as("client").get(
        `/api/workspaces/${ids.workspaces.tienda}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: ids.workspaces.tienda,
        role: { systemKey: "CLIENT" },
      });
    });

    it("espacio archivado: 404 entrando directo, igual que uno inexistente", async () => {
      const archived = await as("owner").get(
        `/api/workspaces/${ids.workspaces.vieja}`,
      );
      const missing = await as("owner").get("/api/workspaces/no-existe");
      expect(archived.status).toBe(404);
      expect(archived.body).toEqual(missing.body);
      expect(
        (
          await as("owner").get(
            `/api/workspaces/${ids.workspaces.vieja}/test-products`,
          )
        ).status,
      ).toBe(404);
    });

    it("usuario de otra cuenta (aunque sea superadmin): 404, igual que un espacio inexistente", async () => {
      const foreign = await as("outsider").get(
        `/api/workspaces/${ids.workspaces.tienda}`,
      );
      const missing = await as("outsider").get("/api/workspaces/no-existe");
      expect(foreign.status).toBe(404);
      expect(missing.status).toBe(404);
      expect(foreign.body).toEqual(missing.body);
      expect((await as("outsider").get(products())).status).toBe(404);
      expect((await as("outsider").delete(`${products()}/1`)).status).toBe(404);
      // Sus propios espacios no incluyen los de la otra cuenta.
      const mine = await as("outsider").get("/api/workspaces");
      expect(
        mine.body.map((workspace: { id: string }) => workspace.id),
      ).toEqual([ids.workspaces.otra]);
    });

    it("dueño: puede ver, crear, editar y eliminar", async () => {
      expect((await as("owner").get(products())).status).toBe(200);
      expect((await as("owner").post(products())).status).toBe(201);
      expect((await as("owner").patch(`${products()}/1`)).status).toBe(200);
      expect((await as("owner").delete(`${products()}/1`)).status).toBe(200);
    });

    it("colaborador sin permiso de eliminar: 403 al eliminar, puede lo demás", async () => {
      expect((await as("collaborator").get(products())).status).toBe(200);
      expect((await as("collaborator").post(products())).status).toBe(201);
      expect((await as("collaborator").patch(`${products()}/1`)).status).toBe(
        200,
      );
      const remove = await as("collaborator").delete(`${products()}/1`);
      expect(remove.status).toBe(403);
      expect(remove.body.message).toBe("forbidden");
    });

    it("cliente (solo lectura): ve, pero no crea, edita ni elimina", async () => {
      expect((await as("client").get(products())).status).toBe(200);
      expect((await as("client").post(products())).status).toBe(403);
      expect((await as("client").patch(`${products()}/1`)).status).toBe(403);
      expect((await as("client").delete(`${products()}/1`)).status).toBe(403);
    });

    it("módulo apagado en el espacio: 404 aunque el rol tenga permiso", async () => {
      const response = await as("owner").get(
        `/api/workspaces/${ids.workspaces.tienda}/test-customers`,
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("not_found");
    });

    it("sin sesión: 401 en toda ruta sin @Public()", async () => {
      expect((await as(null).get("/api/workspaces")).status).toBe(401);
      expect(
        (await as(null).get(`/api/workspaces/${ids.workspaces.tienda}`)).status,
      ).toBe(401);
      expect((await as(null).get(products())).status).toBe(401);
      expect((await as(null).get("/api/auth/me")).status).toBe(401);
    });

    it("las rutas @Public() siguen sin pedir sesión", async () => {
      expect((await as(null).get("/api/health")).status).toBe(200);
      expect((await as(null).get("/api/auth/options")).status).toBe(200);
    });

    it("ruta de espacio sin @RequirePermission ni @WorkspaceMember: falla cerrado (403)", async () => {
      const response = await as("owner").get(
        `/api/workspaces/${ids.workspaces.tienda}/test-undeclared`,
      );
      expect(response.status).toBe(403);
      expect(response.body).not.toHaveProperty("leaked");
    });
  });
}
