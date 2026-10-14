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
- Roles: superadmin de plataforma (`User.isSuperadmin`), y por cuenta: Dueño, Colaborador, Cliente (solo lectura) + roles custom. Permisos = matriz módulo × ver/crear/editar/eliminar (`RolePermission`).
- Productos con variantes: el stock, costo y precio viven en `ProductVariant`, nunca en `Product`.
- Pedido = venta (`Order` + `OrderItem` + `Payment`). Compras/importaciones (`Purchase`) cargan stock y costo.
- Toda tabla de negocio tiene `workspaceId`. **Toda query filtra por workspace y valida que el usuario pertenezca a él.**
- Dinero: `Decimal`, nunca `float`. Moneda explícita (`ARS` / `USD`).

Modelo completo: `apps/api/prisma/schema.prisma`.
Diseño de referencia: `docs/design/` (export de Stitch + tokens). Plan de trabajo: `docs/ROADMAP.md`.

## Forma de trabajo
1. Antes de escribir código, leer los archivos relevantes. Si falta contexto, preguntar; no asumir.
2. Cambios chicos y enfocados. Editar solo lo necesario; no reescribir archivos enteros ni "limpiar" código ajeno a la tarea.
3. Una tarea del ROADMAP por vez. Al terminar, marcarla en `docs/ROADMAP.md`.
4. Antes de decir "listo": `pnpm lint`, `pnpm typecheck` y `pnpm build` (o los tests del módulo) tienen que pasar. Mostrar la evidencia.
5. Commits chicos con mensaje en español y prefijo convencional (`feat:`, `fix:`, `chore:`).
6. Toda pieza visual reutilizable vive en `packages/ui` y se documenta con una story antes de usarse en `apps/web`. Si un componente no existe en el kit, se crea ahí primero; no se arman componentes visuales sueltos dentro de las páginas.
7. Textos de UI siempre por i18n (`apps/web/messages/es.json` y `en.json`, con la misma clave en los dos), nunca hardcodeados.
8. Respuestas directas y breves, sin halagos. No repetir en el chat el código que ya quedó en archivos.
9. Dependencias: nunca desactivar ni saltear `minimumReleaseAge` de pnpm (sin `minimumReleaseAgeExclude`, sin bajar el valor). Elegir siempre la versión más reciente que ya cumpla la regla.
10. Decisiones: cada vez que se toma una decisión técnica o de producto (elegir una librería, un patrón, un cambio de modelo de datos, descartar una alternativa), agregar una entrada al final de `docs/decisiones.md` en el mismo commit. Formato corto: fecha, decisión, por qué, alternativa descartada. No registrar detalles menores de implementación.

## Comandos
Requisitos: pnpm y Docker. pnpm usa la versión que fija `packageManager` y descarga Node 24 para los scripts (`devEngines.runtime`), sin importar qué Node tenga la terminal. `.nvmrc` queda para el editor y las herramientas que corren fuera de pnpm.
```bash
pnpm install                              # dependencias (genera el cliente de Prisma)
cp apps/api/.env.example apps/api/.env    # variables de la API
pnpm db:up                                # Postgres en Docker (puerto 5434)
pnpm --filter @kaname/api db:migrate      # aplica migraciones (crea una nueva si cambió el schema)
pnpm --filter @kaname/api db:seed         # datos iniciales
pnpm dev                                  # web :3000 + api :4000
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
