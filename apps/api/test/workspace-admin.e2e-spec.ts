import type { INestApplication } from "@nestjs/common";
import { DEFAULT_MODULES } from "@kaname/shared";
import request from "supertest";
import type { App } from "supertest/types.js";
import { ACCESS_COOKIE } from "../src/auth/cookies.js";
import { cookieHeader, cookiesOf } from "./support/auth-flow.js";
import { fromIp } from "./support/client-ip.js";
import { createTestApp } from "./support/create-app.js";
import { testPrisma } from "./support/postgres.js";
import {
  FIXTURE_PASSWORD,
  type FixtureIds,
  type FixtureUser,
  seedWorkspaceFixture,
} from "./support/workspace-fixture.js";

// Alta, configuración y archivado de espacios contra Postgres. Solo el Dueño de la cuenta crea,
// edita y archiva; un Colaborador o un Cliente del espacio recibe 403, y alguien de otra cuenta,
// 404 (no sabe que existe).
const prisma = testPrisma();

describe("Alta y configuración de espacios (Postgres)", () => {
  let app: INestApplication<App>;
  let ids: FixtureIds;
  let cleanup: () => Promise<void>;
  const access = new Map<FixtureUser, string>();

  beforeAll(async () => {
    ({ ids, cleanup } = await seedWorkspaceFixture(prisma));
    app = await createTestApp();
    for (const [index, user] of (
      ["owner", "collaborator", "client", "outsider"] as const
    ).entries()) {
      const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .set(fromIp(`192.0.2.${index + 50}`))
        .send({ email: ids.users[user].email, password: FIXTURE_PASSWORD });
      expect(response.status).toBe(200);
      access.set(user, cookiesOf(response).get(ACCESS_COOKIE)!.value);
    }
  });

  afterAll(async () => {
    await app.close();
    await cleanup();
  });

  const as = (user: FixtureUser) => {
    const http = request(app.getHttpServer());
    const cookie = cookieHeader({ [ACCESS_COOKIE]: access.get(user)! });
    return {
      get: (path: string) => http.get(path).set("Cookie", cookie),
      post: (path: string, body?: object) =>
        http.post(path).set("Cookie", cookie).send(body),
      patch: (path: string, body: object) =>
        http.patch(path).set("Cookie", cookie).send(body),
    };
  };

  let counter = 0;
  const newSlug = () => `prueba-${Date.now().toString(36)}-${++counter}`;
  const create = (user: FixtureUser, body: object = {}) =>
    as(user).post("/api/workspaces", {
      accountId: ids.accounts.A,
      name: "Espacio de prueba",
      slug: newSlug(),
      type: "BUSINESS",
      ...body,
    });

  it("GET /api/me/accounts: mis cuentas con mi rol", async () => {
    const owner = await as("owner").get("/api/me/accounts");
    expect(owner.body).toEqual([
      expect.objectContaining({ id: ids.accounts.A, role: "OWNER" }),
    ]);
    const collaborator = await as("collaborator").get("/api/me/accounts");
    expect(collaborator.body).toEqual([
      expect.objectContaining({ id: ids.accounts.A, role: "MEMBER" }),
    ]);
  });

  it("el Dueño crea un espacio: queda como Dueño, con los módulos por defecto de su tipo", async () => {
    const business = await create("owner", { color: "#3D6BD1" });
    expect(business.status).toBe(201);
    expect(business.body).toMatchObject({
      accountId: ids.accounts.A,
      type: "BUSINESS",
      color: "#3d6bd1",
      baseCurrency: "ARS",
      accountRole: "OWNER",
      role: { systemKey: "OWNER" },
      modules: DEFAULT_MODULES.BUSINESS,
    });
    const projects = await create("owner", {
      type: "PROJECTS",
      baseCurrency: "USD",
    });
    expect(projects.body.modules).toEqual(DEFAULT_MODULES.PROJECTS);
    expect(projects.body.baseCurrency).toBe("USD");

    // Aparece en mis espacios.
    const list = await as("owner").get("/api/workspaces");
    expect(list.body.map((w: { id: string }) => w.id)).toEqual(
      expect.arrayContaining([business.body.id, projects.body.id]),
    );
  });

  it("validaciones: slug inválido o repetido en la cuenta, color, nombre", async () => {
    const invalid = async (body: object, code: string) => {
      const response = await create("owner", body);
      expect(response.status).toBe(400);
      expect(response.body.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ code })]),
      );
    };
    await invalid({ slug: "Con Espacios" }, "slug_invalid");
    await invalid({ slug: "-guion" }, "slug_invalid");
    await invalid({ slug: "a" }, "slug_invalid");
    await invalid({ color: "rojo" }, "color_invalid");
    await invalid({ color: "#fff" }, "color_invalid");
    await invalid({ name: "  " }, "name_required");
    await invalid({ type: "OTRO" }, "validation_failed");
    await invalid({ baseCurrency: "EUR" }, "validation_failed");

    const slug = newSlug();
    expect((await create("owner", { slug })).status).toBe(201);
    const repeated = await create("owner", { slug });
    expect(repeated.status).toBe(409);
    expect(repeated.body.message).toBe("slug_taken");
  });

  it("un Colaborador no puede crear; alguien de otra cuenta recibe 404", async () => {
    const collaborator = await create("collaborator");
    expect(collaborator.status).toBe(403);
    expect(collaborator.body.message).toBe("forbidden");
    expect((await create("client")).status).toBe(403);
    expect((await create("outsider")).status).toBe(404);
    // El Dueño de A tampoco crea en la cuenta B.
    expect((await create("owner", { accountId: ids.accounts.B })).status).toBe(
      404,
    );
  });

  it("el Dueño edita datos, color y módulos; el resumen queda siempre activo y primero", async () => {
    const { body: created } = await create("owner");
    const path = `/api/workspaces/${created.id}`;
    const slug = newSlug();
    const response = await as("owner").patch(path, {
      name: "Renombrado",
      slug,
      type: "PROJECTS",
      color: "#2A9D8F",
      baseCurrency: "USD",
      modules: ["ORDERS", "PRODUCTS"],
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: "Renombrado",
      slug,
      type: "PROJECTS",
      color: "#2a9d8f",
      baseCurrency: "USD",
      modules: ["DASHBOARD", "ORDERS", "PRODUCTS"],
    });
    // Sin color vuelve al acento por defecto.
    const reset = await as("owner").patch(path, { color: null });
    expect(reset.body.color).toBeNull();
    // Lo ven también los demás (GET del espacio).
    expect((await as("owner").get(path)).body.modules).toEqual([
      "DASHBOARD",
      "ORDERS",
      "PRODUCTS",
    ]);

    expect((await as("owner").patch(path, {})).status).toBe(400);
    const taken = await as("owner").patch(path, {
      slug: (await create("owner")).body.slug,
    });
    expect(taken.status).toBe(409);
  });

  it("guardados de módulos en paralelo: queda exactamente una de las listas, sin mezclar", async () => {
    const { body: created } = await create("owner");
    const path = `/api/workspaces/${created.id}`;
    const lists = [
      ["PRODUCTS", "ORDERS"],
      ["CUSTOMERS", "CALENDAR", "QUOTES"],
      ["SUPPLIERS"],
      ["ORDERS", "PRODUCTS", "PRICE_LISTS", "CALCULATOR"],
      [],
    ];
    const responses = await Promise.all(
      lists.map((modules) => as("owner").patch(path, { modules })),
    );
    expect(responses.map((response) => response.status)).toEqual(
      lists.map(() => 200),
    );
    const final = (await as("owner").get(path)).body.modules;
    expect(lists.map((modules) => ["DASHBOARD", ...modules])).toContainEqual(
      final,
    );
  });

  it("un Colaborador o un Cliente no puede editar ni archivar; alguien de otra cuenta recibe 404", async () => {
    const path = `/api/workspaces/${ids.workspaces.tienda}`;
    for (const user of ["collaborator", "client"] as const) {
      const edit = await as(user).patch(path, { name: "Hackeado" });
      expect(edit.status).toBe(403);
      expect(edit.body.message).toBe("forbidden");
      expect((await as(user).post(`${path}/archive`)).status).toBe(403);
    }
    expect((await as("outsider").patch(path, { name: "x" })).status).toBe(404);
    expect((await as("outsider").post(`${path}/archive`)).status).toBe(404);
    // Nada cambió.
    const tienda = await as("owner").get(path);
    expect(tienda.body).toMatchObject({ name: "Tienda", archivedAt: null });
  });

  it("archivar: deja de aparecer, su URL da 404 y ya no se puede editar", async () => {
    const { body: created } = await create("owner");
    const path = `/api/workspaces/${created.id}`;
    expect((await as("owner").post(`${path}/archive`)).status).toBe(204);

    const list = await as("owner").get("/api/workspaces");
    expect(list.body.map((w: { id: string }) => w.id)).not.toContain(
      created.id,
    );
    expect((await as("owner").get(path)).status).toBe(404);
    expect((await as("owner").patch(path, { name: "x" })).status).toBe(404);
    expect((await as("owner").post(`${path}/archive`)).status).toBe(404);
  });

  it("slug de un espacio archivado: 409 slug_archived con su id, y el Dueño lo restaura", async () => {
    const { body: created } = await create("owner");
    await as("owner").post(`/api/workspaces/${created.id}/archive`);

    const taken = await create("owner", { slug: created.slug });
    expect(taken.status).toBe(409);
    expect(taken.body).toMatchObject({
      message: "slug_archived",
      workspaceId: created.id,
    });

    const archivedPath = `/api/accounts/${ids.accounts.A}/archived-workspaces`;
    const list = await as("owner").get(archivedPath);
    expect(list.status).toBe(200);
    expect(list.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: created.id, slug: created.slug }),
      ]),
    );

    expect(
      (await as("owner").post(`${archivedPath}/${created.id}/restore`)).status,
    ).toBe(204);
    expect(
      (await as("owner").get(`/api/workspaces/${created.id}`)).status,
    ).toBe(200);
    // Ya no está archivado: restaurarlo otra vez da 404.
    expect(
      (await as("owner").post(`${archivedPath}/${created.id}/restore`)).status,
    ).toBe(404);
  });

  it("archivados: solo el Dueño de la cuenta los ve y los restaura", async () => {
    const { body: created } = await create("owner");
    await as("owner").post(`/api/workspaces/${created.id}/archive`);
    const archivedPath = `/api/accounts/${ids.accounts.A}/archived-workspaces`;
    const restore = `${archivedPath}/${created.id}/restore`;

    for (const user of ["collaborator", "client"] as const) {
      expect((await as(user).get(archivedPath)).status).toBe(403);
      expect((await as(user).post(restore)).status).toBe(403);
    }
    expect((await as("outsider").get(archivedPath)).status).toBe(404);
    expect((await as("outsider").post(restore)).status).toBe(404);
    // El Dueño de B no restaura un archivado de A desde su propia cuenta.
    expect(
      (
        await as("outsider").post(
          `/api/accounts/${ids.accounts.B}/archived-workspaces/${created.id}/restore`,
        )
      ).status,
    ).toBe(404);
    expect(
      (await as("owner").get(`/api/workspaces/${created.id}`)).status,
    ).toBe(404);
  });
});
