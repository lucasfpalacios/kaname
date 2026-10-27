# Kaname — contexto del proyecto

**Kaname (要)**: el remache que sostiene todas las varillas de un abanico; el eje que une todos los negocios. Logo: abanico con su remache. Las pantallas de Stitch dicen "Nexo" (nombre provisorio): en el código siempre va Kaname.

Plataforma web para administrar varios emprendimientos desde un solo panel. Hoy la usa Lucas (único usuario). Más adelante se vende como SaaS multi-tenant, así que todo se diseña multi-tenant desde el día 1.

## Stack (no cambiar sin preguntar)
- Monorepo: pnpm workspaces + Turborepo
- `apps/web`: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- `apps/api`: NestJS + TypeScript + Prisma
- `packages/ui`: **UI Kit** de Kaname (`@kaname/ui`): tokens, componentes base (shadcn/ui) y componentes propios, documentados en Storybook
- Base de datos: PostgreSQL (Neon free en prod, Docker en local)
- i18n: next-intl (es por defecto, en). Tema: next-themes (claro / oscuro / sistema)
- Auth: JWT propio en Nest (access + refresh) + Google OAuth
- Colas y scraping: BullMQ + Redis (Upstash) + Playwright
- Archivos: Cloudflare R2. PDFs: generados desde plantillas HTML
- **Restricción: costo cero.** Solo servicios con plan gratuito. Si algo requiere pagar, frenar y preguntar.

## Dominio
- `Account` (tenant) → `Workspace` (espacio) → módulos activables (`WorkspaceModule`).
- Tipos de espacio: `BUSINESS` (Tank Vault TCG, Disanza, VISIÓ) y `PROJECTS` (Shinka, con clientes como Hiru Cerámica).
- Roles: superadmin de plataforma (`User.isSuperadmin`), y por cuenta: Dueño, Colaborador, Cliente (solo lectura) + roles custom. Los del sistema se identifican por `Role.systemKey` y la UI traduce su nombre (`Roles.<clave>`); los custom usan `name`. Permisos = matriz módulo × ver/crear/editar/eliminar (`RolePermission`).
- Productos con variantes: el stock, costo y precio viven en `ProductVariant`, nunca en `Product`.
- Pedido = venta (`Order` + `OrderItem` + `Payment`). Compras/importaciones (`Purchase`) cargan stock y costo.
- Las tablas de negocio de primer nivel (y `ProductVariant`, que se consulta directo) tienen `workspaceId`. Las tablas hijas (ítems de pedido/compra/presupuesto, pagos, recetas, ítems de lista de precios, precios de mercado, snapshots) heredan el espacio de su padre. **Toda query filtra por workspace (directo o por el padre) y valida que el usuario pertenezca a él.** Toda FK que cruce entidades (por ejemplo `variantId` en un ítem de pedido) se valida contra el mismo espacio antes de guardar.
- Dinero: `Decimal`, nunca `float`. Moneda explícita (`ARS` / `USD`).

Modelo completo: `apps/api/prisma/schema.prisma`.
Diseño de referencia: `docs/design/` (export de Stitch + tokens). Plan de trabajo: `docs/ROADMAP.md`.

## Forma de trabajo
1. Antes de escribir código, leer los archivos relevantes. Si falta contexto, preguntar; no asumir.
2. Cambios chicos y enfocados. Editar solo lo necesario; no reescribir archivos enteros ni "limpiar" código ajeno a la tarea.
3. Una tarea del ROADMAP por vez. Al terminar, marcarla en `docs/ROADMAP.md`.
4. Antes de decir "listo": `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test` y `pnpm format:check` tienen que pasar. Mostrar la evidencia.
5. Commits chicos con mensaje en español y prefijo convencional (`feat:`, `fix:`, `chore:`).
6. Toda pieza visual reutilizable vive en `packages/ui` y se documenta con una story antes de usarse en `apps/web`. Si un componente no existe en el kit, se crea ahí primero; no se arman componentes visuales sueltos dentro de las páginas.
7. Textos de UI siempre por i18n (`apps/web/messages/es.json` y `en.json`, con la misma clave en los dos), nunca hardcodeados.
8. Respuestas directas y breves, sin halagos. No repetir en el chat el código que ya quedó en archivos.
9. Dependencias: nunca desactivar ni saltear `minimumReleaseAge` de pnpm (sin `minimumReleaseAgeExclude`, sin bajar el valor). Elegir siempre la versión más reciente que ya cumpla la regla.
10. Decisiones: cada vez que se toma una decisión técnica o de producto (elegir una librería, un patrón, un cambio de modelo de datos, descartar una alternativa), agregar una entrada al final de `docs/decisiones.md` en el mismo commit. Formato corto: fecha, decisión, por qué, alternativa descartada. No registrar detalles menores de implementación.

## Proteger un endpoint (API)
Tres guards globales corren en cada pedido, en este orden: sesión, membresía del espacio y permiso. No hace falta `@UseGuards`: alcanza con los decoradores.
- **Sin decorador:** exige sesión (401 si no hay). Sirve para lo que es del usuario y no de un espacio (por ejemplo, `GET /api/workspaces`).
- **`@Public()`:** sin sesión. Solo para lo que se usa sin iniciar sesión: login, registro, refresh, logout, health.
- **`@WorkspaceMember()`:** cualquier miembro del espacio de `:workspaceId`. Si no es miembro o el espacio no existe: 404.
- **`@RequirePermission(ModuleKey.X, "view" | "create" | "edit" | "delete")`:** miembro, con el módulo activo en el espacio (si no, 404) y con ese permiso en la matriz `RolePermission` de su rol (si no, 403).
- Una ruta con `:workspaceId` sin ninguno de los dos decoradores se rechaza (403) y queda en el log: nunca queda abierta por olvido.
- El superadmin de plataforma no tiene acceso implícito: ve solo los espacios de los que es miembro.

```ts
@Controller("workspaces/:workspaceId/products")
export class ProductsController {
  @Get()
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  list(@CurrentWorkspace() workspace: Membership) {
    // workspace.workspace.id ya está validado: filtrar siempre por él.
    return this.products.list(workspace.workspace.id);
  }

  @Delete(":productId")
  @RequirePermission(ModuleKey.PRODUCTS, "delete")
  remove(@CurrentWorkspace() workspace: Membership, @Param("productId") id: string) {
    // El guard valida el espacio, no el producto: buscarlo con { id, workspaceId }.
    return this.products.remove(workspace.workspace.id, id);
  }
}
```
Cada endpoint nuevo suma tests de permisos en la suite de `test/support/workspace-access-flow.ts` o en una propia, igual que los de esa suite.

## Comandos
Requisitos: pnpm y Docker. pnpm usa la versión que fija `packageManager` y descarga Node 24 para los scripts (`devEngines.runtime`), sin importar qué Node tenga la terminal. `.nvmrc` queda para el editor y las herramientas que corren fuera de pnpm.

Todo se corre desde la raíz. `lint`, `typecheck`, `build`, `dev` y `test` pasan por Turborepo: corren en cada paquete que tenga el script, en orden de dependencias (primero `@kaname/shared` y el cliente de Prisma) y con caché.

**Primera vez**
```bash
pnpm install                              # dependencias (genera el cliente de Prisma)
cp apps/api/.env.example apps/api/.env    # variables de la API
cp apps/web/.env.example apps/web/.env.local  # variables de la web (NEST_URL)
pnpm db:up                                # Postgres en Docker (puerto 5434)
pnpm --filter @kaname/api db:migrate      # aplica las migraciones
pnpm --filter @kaname/api db:seed         # datos iniciales
```

**Día a día**
```bash
pnpm dev            # web :3000 + api :4000 + shared en watch
pnpm lint           # ESLint en todos los paquetes (config en @kaname/eslint-config)
pnpm typecheck      # tsc en todos los paquetes
pnpm build          # build de producción (shared, api, web)
pnpm test           # tests unitarios (Vitest en la api y en el kit)
pnpm format         # Prettier en todo el repo
pnpm format:check   # verifica el formato sin escribir
pnpm db:up / db:down
```

**Base de datos** (`pnpm --filter @kaname/api <script>`)
```bash
db:migrate   # crea y aplica una migración si cambió schema.prisma
db:seed      # vuelve a correr el seed (es idempotente)
db:studio    # Prisma Studio
db:generate  # regenera el cliente (lo hace turbo solo antes de lint/typecheck/build/dev/test)
test:e2e     # tests e2e de la api, contra la base kaname_test (se crea y migra sola; nunca la de desarrollo)
```

**Deploy** (todavía sin configurar): construir siempre con turbo para que `@kaname/shared` y el cliente de Prisma se generen antes, por ejemplo `pnpm turbo run build --filter=@kaname/web` en Vercel y `--filter=@kaname/api` en Render. En la API, `prisma migrate deploy` usa `DIRECT_URL` (conexión sin pooler de Neon) y la app usa `DATABASE_URL` (con pooler).

**Antes de decir "listo"**
```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test && pnpm format:check
```

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
