# Kaname — contexto del proyecto

**Kaname (要)**: el remache que sostiene todas las varillas de un abanico; el eje que une todos los negocios. Logo: abanico con su remache. Las pantallas de Stitch dicen "Nexo" (nombre provisorio): en el código siempre va Kaname.

Plataforma web para administrar varios emprendimientos desde un solo panel. Hoy la usa Lucas (único usuario). Más adelante se vende como SaaS multi-tenant, así que todo se diseña multi-tenant desde el día 1.

## Stack (no cambiar sin preguntar)
- Monorepo: pnpm workspaces + Turborepo
- `apps/web`: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- `apps/api`: NestJS + TypeScript + Prisma
- `packages/ui`: **UI Kit** de Nexo (`@kaname/ui`): tokens, componentes base (shadcn/ui) y componentes propios, documentados en Storybook
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

Modelo completo: `docs/data-model/schema.prisma` (se mueve a `apps/api/prisma/` en la fase 0).
Diseño de referencia: `docs/design/` (export de Stitch + tokens). Plan de trabajo: `docs/ROADMAP.md`.

## Forma de trabajo
1. Antes de escribir código, leer los archivos relevantes. Si falta contexto, preguntar; no asumir.
2. Cambios chicos y enfocados. Editar solo lo necesario; no reescribir archivos enteros ni "limpiar" código ajeno a la tarea.
3. Una tarea del ROADMAP por vez. Al terminar, marcarla en `docs/ROADMAP.md`.
4. Antes de decir "listo": `pnpm lint`, `pnpm typecheck` y `pnpm build` (o los tests del módulo) tienen que pasar. Mostrar la evidencia.
5. Commits chicos con mensaje en español y prefijo convencional (`feat:`, `fix:`, `chore:`).
6. Toda pieza visual reutilizable vive en `packages/ui` y se documenta con una story antes de usarse en `apps/web`. Si un componente no existe en el kit, se crea ahí primero; no se arman componentes visuales sueltos dentro de las páginas.
7. Textos de UI siempre por i18n (`messages/es.json`, `messages/en.json`), nunca hardcodeados.
8. Respuestas directas y breves, sin halagos. No repetir en el chat el código que ya quedó en archivos.

## Comandos
(Se completan en la fase 0.)
