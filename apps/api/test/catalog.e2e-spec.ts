import type { INestApplication } from "@nestjs/common";
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

// Catálogo contra Postgres: categorías, productos, variantes y stock. El espacio "Tienda" tiene
// Productos activo; el Dueño hace todo, el Colaborador no borra y el Cliente solo ve. "Otra" es de
// otra cuenta: sus categorías y proveedores no se pueden usar desde "Tienda".
const prisma = testPrisma();

describe("Catálogo (Postgres)", () => {
  let app: INestApplication<App>;
  let ids: FixtureIds;
  let cleanup: () => Promise<void>;
  const access = new Map<FixtureUser, string>();
  let supplierId: string;
  let foreignSupplierId: string;
  let foreignCategoryId: string;

  beforeAll(async () => {
    ({ ids, cleanup } = await seedWorkspaceFixture(prisma));
    app = await createTestApp();
    for (const [index, user] of (
      ["owner", "collaborator", "client", "outsider"] as const
    ).entries()) {
      const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .set(fromIp(`192.0.2.${index + 80}`))
        .send({ email: ids.users[user].email, password: FIXTURE_PASSWORD });
      expect(response.status).toBe(200);
      access.set(user, cookiesOf(response).get(ACCESS_COOKIE)!.value);
    }
    supplierId = (
      await prisma.supplier.create({
        data: { workspaceId: ids.workspaces.tienda, name: "Proveedor propio" },
      })
    ).id;
    foreignSupplierId = (
      await prisma.supplier.create({
        data: { workspaceId: ids.workspaces.otra, name: "Proveedor ajeno" },
      })
    ).id;
    foreignCategoryId = (
      await prisma.category.create({
        data: { workspaceId: ids.workspaces.otra, name: "Categoría ajena" },
      })
    ).id;
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
      delete: (path: string) => http.delete(path).set("Cookie", cookie),
    };
  };
  const base = () => `/api/workspaces/${ids.workspaces.tienda}`;
  let counter = 0;
  const unique = (prefix: string) =>
    `${prefix}-${Date.now().toString(36)}-${++counter}`;

  const createProduct = (body: object, user: FixtureUser = "owner") =>
    as(user).post(`${base()}/products`, { name: unique("Producto"), ...body });

  describe("categorías", () => {
    it("CRUD con un nivel de jerarquía y nombre único por padre", async () => {
      const root = await as("owner").post(`${base()}/categories`, {
        name: unique("Cartas"),
      });
      expect(root.status).toBe(201);
      const child = await as("owner").post(`${base()}/categories`, {
        name: "Sobres",
        parentId: root.body.id,
      });
      expect(child.status).toBe(201);
      expect(child.body).toMatchObject({
        parentId: root.body.id,
        productCount: 0,
      });

      // Mismo nombre bajo el mismo padre: 409; bajo otro padre, permitido.
      const repeated = await as("owner").post(`${base()}/categories`, {
        name: "Sobres",
        parentId: root.body.id,
      });
      expect(repeated.status).toBe(409);
      expect(repeated.body.message).toBe("category_name_taken");
      const rootRepeated = await as("owner").post(`${base()}/categories`, {
        name: root.body.name,
      });
      expect(rootRepeated.status).toBe(409);

      // Un solo nivel: no se cuelga nada de una subcategoría.
      const grandchild = await as("owner").post(`${base()}/categories`, {
        name: "Nieta",
        parentId: child.body.id,
      });
      expect(grandchild.status).toBe(400);
      expect(grandchild.body.message).toBe("category_depth");
      // Una categoría con hijas no pasa a ser hija.
      const other = await as("owner").post(`${base()}/categories`, {
        name: unique("Otra raíz"),
      });
      const moveParent = await as("owner").patch(
        `${base()}/categories/${root.body.id}`,
        { parentId: other.body.id },
      );
      expect(moveParent.status).toBe(400);

      // Con subcategorías no se borra; sin ellas, sí (y sus productos quedan sin categoría).
      expect(
        (await as("owner").delete(`${base()}/categories/${root.body.id}`))
          .status,
      ).toBe(409);
      const product = await createProduct({ categoryId: child.body.id });
      expect(
        (await as("owner").delete(`${base()}/categories/${child.body.id}`))
          .status,
      ).toBe(204);
      expect(
        (await as("owner").get(`${base()}/products/${product.body.id}`)).body
          .category,
      ).toBeNull();

      const list = await as("client").get(`${base()}/categories`);
      expect(list.status).toBe(200);
      expect(list.body.map((c: { id: string }) => c.id)).toContain(
        root.body.id,
      );
    });

    it("una categoría de otro espacio como padre: 400 category_invalid", async () => {
      const response = await as("owner").post(`${base()}/categories`, {
        name: unique("Hija"),
        parentId: foreignCategoryId,
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("category_invalid");
    });
  });

  describe("productos y variantes", () => {
    it("sin opciones: crea la variante default con su stock inicial como ajuste", async () => {
      const response = await createProduct({
        kind: "SUPPLY",
        description: "Fundas transparentes",
        variant: {
          sku: unique("FUN"),
          costAmount: "1250.50",
          costCurrency: "USD",
          unit: "u",
          reorderPoint: "10",
          defaultSupplierId: supplierId,
          initialStock: "25",
        },
      });
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ kind: "SUPPLY", options: [] });
      expect(response.body.variants).toHaveLength(1);
      const [variant] = response.body.variants;
      expect(variant).toMatchObject({
        isDefault: true,
        name: null,
        costAmount: "1250.50",
        costCurrency: "USD",
        stock: "25.000",
        reorderPoint: "10.000",
        defaultSupplierId: supplierId,
        lowStock: false,
      });
      const movements = await as("owner").get(
        `${base()}/variants/${variant.id}/stock-movements`,
      );
      expect(movements.body).toEqual([
        expect.objectContaining({
          type: "ADJUSTMENT",
          quantity: "25.000",
          note: "Stock inicial",
        }),
      ]);
    });

    it("con opciones: crea las combinaciones elegidas y genera más después", async () => {
      const options = [
        { name: "Idioma", values: ["EN", "ES"] },
        { name: "Estado", values: ["NM", "LP"] },
      ];
      // Con opciones hace falta al menos una combinación.
      const empty = await createProduct({ options });
      expect(empty.status).toBe(400);

      const created = await createProduct({
        options,
        combinations: [
          { optionValues: { Idioma: "EN", Estado: "NM" }, initialStock: "3" },
        ],
      });
      expect(created.status).toBe(201);
      expect(created.body.variants).toEqual([
        expect.objectContaining({
          name: "EN · NM",
          stock: "3.000",
          isDefault: false,
        }),
      ]);
      const productPath = `${base()}/products/${created.body.id}`;

      const combos = await as("owner").get(`${productPath}/combinations`);
      expect(combos.body).toHaveLength(4);
      expect(
        combos.body.filter((c: { variantId: string | null }) => c.variantId),
      ).toHaveLength(1);

      const generated = await as("owner").post(`${productPath}/variants`, {
        combinations: [
          { optionValues: { Idioma: "ES", Estado: "NM" } },
          { optionValues: { Idioma: "ES", Estado: "LP" }, costAmount: "100" },
        ],
      });
      expect(generated.status).toBe(201);
      expect(
        generated.body.variants.map((v: { name: string }) => v.name),
      ).toEqual(["EN · NM", "ES · NM", "ES · LP"]);

      // Una que ya existe, o con valores que no están en las opciones.
      const again = await as("owner").post(`${productPath}/variants`, {
        combinations: [{ optionValues: { Idioma: "EN", Estado: "NM" } }],
      });
      expect(again.status).toBe(409);
      expect(again.body.message).toBe("combination_exists");
      const invalid = await as("owner").post(`${productPath}/variants`, {
        combinations: [{ optionValues: { Idioma: "JP", Estado: "NM" } }],
      });
      expect(invalid.status).toBe(400);
      expect(invalid.body.message).toBe("combination_invalid");

      // Cambiar las opciones dejando variantes sin valor válido: 409.
      const inUse = await as("owner").patch(productPath, {
        options: [{ name: "Idioma", values: ["EN"] }, options[1]],
      });
      expect(inUse.status).toBe(409);
      expect(inUse.body.message).toBe("options_in_use");
      // Agregar un valor sí se puede.
      const added = await as("owner").patch(productPath, {
        options: [{ name: "Idioma", values: ["EN", "ES", "JP"] }, options[1]],
      });
      expect(added.status).toBe(200);
      expect(
        (await as("owner").get(`${productPath}/combinations`)).body,
      ).toHaveLength(6);
    });

    it("SKU único por espacio: repetido da 409, y sin SKU no choca", async () => {
      const sku = unique("SKU");
      expect((await createProduct({ variant: { sku } })).status).toBe(201);
      const repeated = await createProduct({ variant: { sku } });
      expect(repeated.status).toBe(409);
      expect(repeated.body.message).toBe("sku_taken");
      // Dentro de un mismo pedido, también.
      const twice = await createProduct({
        options: [{ name: "Talle", values: ["S", "M"] }],
        combinations: [
          { optionValues: { Talle: "S" }, sku: unique("DOS") + "x" },
          { optionValues: { Talle: "M" }, sku: unique("DOS") + "x" },
        ],
      });
      expect(twice.status).toBe(201);
      const same = unique("MISMO");
      const sameTwice = await createProduct({
        options: [{ name: "Talle", values: ["S", "M"] }],
        combinations: [
          { optionValues: { Talle: "S" }, sku: same },
          { optionValues: { Talle: "M" }, sku: same },
        ],
      });
      expect(sameTwice.status).toBe(409);
      // Sin SKU: varios productos sin chocar.
      expect((await createProduct({})).status).toBe(201);
      expect((await createProduct({})).status).toBe(201);
      // Editar una variante con un SKU tomado.
      const product = await createProduct({});
      const conflict = await as("owner").patch(
        `${base()}/variants/${product.body.variants[0].id}`,
        { sku },
      );
      expect(conflict.status).toBe(409);
    });

    it("la última variante de un producto no se borra", async () => {
      const product = await createProduct({
        options: [{ name: "Color", values: ["Rojo", "Azul"] }],
        combinations: [
          { optionValues: { Color: "Rojo" } },
          { optionValues: { Color: "Azul" } },
        ],
      });
      const [first, second] = product.body.variants;
      expect(
        (await as("owner").delete(`${base()}/variants/${first.id}`)).status,
      ).toBe(204);
      const last = await as("owner").delete(`${base()}/variants/${second.id}`);
      expect(last.status).toBe(409);
      expect(last.body.message).toBe("last_variant");
    });

    it("una categoría o un proveedor de otro espacio se rechaza", async () => {
      const category = await createProduct({ categoryId: foreignCategoryId });
      expect(category.status).toBe(400);
      expect(category.body.message).toBe("category_invalid");
      const supplier = await createProduct({
        variant: { defaultSupplierId: foreignSupplierId },
      });
      expect(supplier.status).toBe(400);
      expect(supplier.body.message).toBe("supplier_invalid");
      const product = await createProduct({});
      const patch = await as("owner").patch(
        `${base()}/variants/${product.body.variants[0].id}`,
        { defaultSupplierId: foreignSupplierId },
      );
      expect(patch.status).toBe(400);
      expect(patch.body.message).toBe("supplier_invalid");
    });
  });

  describe("stock", () => {
    it("un ajuste crea su movimiento y actualiza el stock; nunca queda negativo", async () => {
      const product = await createProduct({ variant: { initialStock: "10" } });
      const variantPath = `${base()}/variants/${product.body.variants[0].id}`;

      const out = await as("owner").post(`${variantPath}/stock-adjustments`, {
        quantity: "-3.5",
        note: "Rotura",
      });
      expect(out.status).toBe(201);
      expect(out.body.variant.stock).toBe("6.500");
      expect(out.body.movement).toMatchObject({
        type: "ADJUSTMENT",
        quantity: "-3.500",
        note: "Rotura",
      });

      const tooMuch = await as("owner").post(
        `${variantPath}/stock-adjustments`,
        {
          quantity: "-7",
        },
      );
      expect(tooMuch.status).toBe(409);
      expect(tooMuch.body.message).toBe("stock_negative");

      for (const quantity of ["0", "abc", "1.2345"]) {
        expect(
          (
            await as("owner").post(`${variantPath}/stock-adjustments`, {
              quantity,
            })
          ).status,
        ).toBe(400);
      }

      // El stock no se edita directo: el PATCH lo ignora.
      await as("owner").patch(variantPath, { stock: "999", unit: "kg" });
      const movements = await as("owner").get(`${variantPath}/stock-movements`);
      expect(
        movements.body.map((m: { quantity: string }) => m.quantity),
      ).toEqual(["-3.500", "10.000"]);
      const current = await as("owner").get(
        `${base()}/products/${product.body.id}`,
      );
      expect(current.body.variants[0]).toMatchObject({
        stock: "6.500",
        unit: "kg",
      });
    });

    it("ajustes en paralelo no dejan el stock negativo", async () => {
      const product = await createProduct({ variant: { initialStock: "5" } });
      const path = `${base()}/variants/${product.body.variants[0].id}/stock-adjustments`;
      const results = await Promise.all(
        Array.from({ length: 8 }, () =>
          as("owner").post(path, { quantity: "-1" }),
        ),
      );
      expect(results.filter((r) => r.status === 201)).toHaveLength(5);
      expect(results.filter((r) => r.status === 409)).toHaveLength(3);
      const current = await as("owner").get(
        `${base()}/products/${product.body.id}`,
      );
      expect(current.body.variants[0].stock).toBe("0.000");
    });

    it("una variante sin control de stock no acepta ajustes", async () => {
      const service = await createProduct({ kind: "SERVICE" });
      expect(service.body.variants[0].trackStock).toBe(false);
      const response = await as("owner").post(
        `${base()}/variants/${service.body.variants[0].id}/stock-adjustments`,
        { quantity: "1" },
      );
      expect(response.status).toBe(409);
      expect(response.body.message).toBe("stock_not_tracked");
    });
  });

  describe("listado", () => {
    it("búsqueda, filtros por categoría (con subcategorías), tipo y stock bajo, y paginación", async () => {
      const tag = unique("lista");
      const root = await as("owner").post(`${base()}/categories`, {
        name: tag,
      });
      const child = await as("owner").post(`${base()}/categories`, {
        name: "sub",
        parentId: root.body.id,
      });
      await createProduct({ name: `${tag} A`, categoryId: root.body.id });
      await createProduct({
        name: `${tag} B`,
        categoryId: child.body.id,
        kind: "SUPPLY",
        variant: { sku: `${tag}-SKU`, reorderPoint: "5", initialStock: "2" },
      });
      await createProduct({
        name: `${tag} C`,
        variant: { reorderPoint: "5", initialStock: "9" },
      });

      const list = (query: string) =>
        as("client").get(`${base()}/products?${query}`);

      const byName = await list(`q=${encodeURIComponent(tag)}`);
      expect(byName.status).toBe(200);
      expect(byName.body.total).toBe(3);
      expect(byName.body.items.map((p: { name: string }) => p.name)).toEqual([
        `${tag} A`,
        `${tag} B`,
        `${tag} C`,
      ]);
      expect((await list(`q=${tag}-sku`)).body.items).toHaveLength(1);

      const byCategory = await list(`categoryId=${root.body.id}`);
      expect(byCategory.body.total).toBe(2);
      expect((await list(`categoryId=${child.body.id}`)).body.total).toBe(1);

      const supplies = await list(`q=${tag}&kind=SUPPLY`);
      expect(supplies.body.items.map((p: { name: string }) => p.name)).toEqual([
        `${tag} B`,
      ]);

      const low = await list(`q=${tag}&lowStock=true`);
      expect(low.body.items).toEqual([
        expect.objectContaining({
          name: `${tag} B`,
          lowStock: true,
          totalStock: "2.000",
        }),
      ]);

      const page = await list(`q=${tag}&pageSize=2&page=2`);
      expect(page.body).toMatchObject({ total: 3, page: 2, pageSize: 2 });
      expect(page.body.items).toHaveLength(1);

      expect((await list("pageSize=500")).status).toBe(400);
      expect((await list("kind=OTRO")).status).toBe(400);
    });
  });

  describe("permisos y aislamiento", () => {
    it("el Cliente solo ve: no crea, no edita, no ajusta stock ni borra", async () => {
      const product = await createProduct({});
      const productPath = `${base()}/products/${product.body.id}`;
      const variantPath = `${base()}/variants/${product.body.variants[0].id}`;

      expect((await as("client").get(`${base()}/products`)).status).toBe(200);
      expect((await as("client").get(productPath)).status).toBe(200);
      const attempts = [
        await createProduct({}, "client"),
        await as("client").patch(productPath, { name: "x" }),
        await as("client").delete(productPath),
        await as("client").post(`${productPath}/variants`, {
          combinations: [{ optionValues: {} }],
        }),
        await as("client").patch(variantPath, { unit: "kg" }),
        await as("client").post(`${variantPath}/stock-adjustments`, {
          quantity: "1",
        }),
        await as("client").delete(variantPath),
        await as("client").post(`${base()}/categories`, { name: unique("x") }),
      ];
      for (const response of attempts) {
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("forbidden");
      }
    });

    it("el Colaborador crea, edita y ajusta, pero no borra", async () => {
      const product = await createProduct({}, "collaborator");
      expect(product.status).toBe(201);
      const variantPath = `${base()}/variants/${product.body.variants[0].id}`;
      expect(
        (
          await as("collaborator").post(`${variantPath}/stock-adjustments`, {
            quantity: "2",
          })
        ).status,
      ).toBe(201);
      expect(
        (
          await as("collaborator").delete(
            `${base()}/products/${product.body.id}`,
          )
        ).status,
      ).toBe(403);
    });

    it("otra cuenta no ve ni toca el catálogo (404), y un id de otro espacio da 404", async () => {
      const product = await createProduct({});
      const productPath = `${base()}/products/${product.body.id}`;
      expect((await as("outsider").get(productPath)).status).toBe(404);
      expect((await as("outsider").get(`${base()}/products`)).status).toBe(404);
      // Desde su propio espacio, el producto de "Tienda" no existe.
      const own = `/api/workspaces/${ids.workspaces.otra}`;
      expect(
        (await as("outsider").get(`${own}/products/${product.body.id}`)).status,
      ).toBe(404);
      expect(
        (
          await as("outsider").post(
            `${own}/variants/${product.body.variants[0].id}/stock-adjustments`,
            { quantity: "1" },
          )
        ).status,
      ).toBe(404);
      expect(
        (await as("outsider").delete(`${own}/products/${product.body.id}`))
          .status,
      ).toBe(404);
      expect((await as("owner").get(productPath)).status).toBe(200);
    });
  });
});
