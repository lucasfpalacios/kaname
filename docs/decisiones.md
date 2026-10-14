# Registro de decisiones

Cada entrada: qué se decidió, por qué y qué se descartó. Se agrega al final, no se editan las anteriores (si una decisión cambia, se agrega una nueva que la reemplaza).

---

### 2026-10-13 · Stack: Next.js + NestJS + PostgreSQL con Prisma
**Por qué:** stack que ya domino (mismo que el CRM SaaS). Los datos son relacionales (productos, variantes, proveedores, pedidos, precios) y Postgres resuelve bien los cruces y reportes; `JSONB` cubre lo flexible (configuración de módulos, dashboards, fórmulas).
**Descartado:** MongoDB. La flexibilidad no compensa perder relaciones e integridad en datos de negocio.

### 2026-10-13 · Multi-tenant desde el día 1
**Por qué:** hoy lo uso yo solo, pero el objetivo es venderlo. Agregar multi-tenancy después obliga a migrar todas las tablas y revisar cada query. Jerarquía: `Account` (cliente del SaaS) → `Workspace` (espacio) → módulos activables.
**Descartado:** base por cliente o schema por cliente. Más caro y complejo de operar con plan gratuito; se puede sumar Row-Level Security de Postgres más adelante si hace falta aislamiento fuerte.

### 2026-10-13 · Espacios de dos tipos: emprendimiento y proyectos
**Por qué:** Tank Vault, Disanza y VISIÓ son negocios; Shinka agrupa proyectos de clientes (Hiru Cerámica). Un mismo modelo con `WorkspaceType` evita dos sistemas distintos.

### 2026-10-13 · Módulos activables por espacio
**Por qué:** cada negocio usa cosas distintas (Disanza necesita recetas, Tank Vault importaciones). Cada espacio prende solo lo que usa y el sidebar se arma desde esa configuración.

### 2026-10-13 · Roles con matriz de permisos editable
**Por qué:** roles del sistema (Dueño, Colaborador, Cliente solo lectura) más roles propios por cuenta. Permisos = módulo × ver/crear/editar/eliminar. Superadmin de plataforma separado del resto.
**Descartado:** roles fijos en código. No escala cuando cada cliente del SaaS necesite los suyos.

### 2026-10-13 · Calculadora como motor de fórmulas con plantillas
**Por qué:** cada negocio calcula precios distinto (importación con dólar MEP vs. costeo por receta). Variables y fórmulas se guardan como datos; las plantillas por negocio se arman sin tocar código.
**Descartado:** calculadoras fijas por tipo de negocio.

### 2026-10-13 · Precios de mercado por scraping, con API oficial cuando exista
**Por qué:** se necesitan precios de distintas fuentes según el negocio. Worker aparte (BullMQ + Playwright) con historial de precios.
**Descartado:** carga manual como única opción. Se mantiene como respaldo (`MarketSourceKind.MANUAL`).

### 2026-10-13 · Productos con variantes
**Por qué:** la misma carta existe en varios idiomas y estados (EN/ES, NM/LP); un combo puede tener tamaños. Stock, costo, SKU y precio viven en `ProductVariant`; un producto simple tiene una sola variante por defecto.
**Descartado:** stock en `Product` con campos opcionales de variante. Se rompe apenas aparece la segunda variante.

### 2026-10-13 · Pedido = venta, y compras separadas
**Por qué:** una venta es un pedido confirmado y cobrado (`Order` + `Payment`), así no hay dos entidades que se pisan. Cada ítem guarda el costo del momento para que el margen histórico no cambie. Las compras/importaciones (`Purchase`) son las que cargan stock y costo, con el dólar usado.

### 2026-10-13 · Costo cero
**Por qué:** proyecto personal sin presupuesto. Solo servicios con plan gratuito: Vercel, Render, Neon, Upstash, Cloudflare R2, GitHub Actions.
**Riesgo conocido:** Vercel Hobby no permite uso comercial; al venderlo hay que migrar o pagar.

### 2026-10-13 · Diseño en Stitch como referencia, no como código final
**Por qué:** Stitch sirvió para validar estructura y navegación rápido. Sus colores generados no coinciden con la paleta; la fuente de verdad es `docs/design/tokens.md` y las pantallas se reconstruyen con el UI Kit.

### 2026-10-14 · Identidad: nombre Kaname, paleta y tipografía japonesas
**Por qué:** Kaname (要) es el remache que sostiene el abanico: el eje que une todos los negocios. Paleta de colores tradicionales japoneses (azul Ruri, rosa Momo). Tipografía Shippori Mincho B1 para títulos y Zen Kaku Gothic New para la interfaz; kanji por módulo como acento.
**Descartado:** Nexo (genérico), Banto (más directo pero menos recorrido como marca).

### 2026-10-14 · UI Kit propio en `packages/ui` con Storybook
**Por qué:** todas las pantallas se arman con los mismos componentes, el tema claro/oscuro y el acento por espacio salen de tokens, y cada componente queda documentado. Sin dependencias de Next ni de i18n para poder reutilizarlo.

### 2026-10-14 · Monorepo (pnpm workspaces + Turborepo)
**Por qué:** un solo desarrollador, código compartido entre web y api (`packages/shared`), cambios de punta a punta en un commit y el agente ve todo el contexto. Los deploys siguen siendo independientes.
**Descartado:** repos separados para front y back. Tiene sentido con equipos distintos o una API pública versionada; hoy no aplica.

### 2026-10-14 · Desarrollo asistido por IA con reglas versionadas
**Por qué:** desarrollo con Claude Code dentro de Cursor. El contexto (`AGENTS.md`, `CLAUDE.md`, reglas por área) vive en el repo para que cualquier agente trabaje con las mismas convenciones, y un subagente revisor de solo lectura revisa cada fase.

### 2026-10-14 · Nunca saltear `minimumReleaseAge` de pnpm
**Por qué:** la mayoría de los paquetes comprometidos se detectan en los primeros días. Se usa la última versión que ya cumple la regla (turbo 2.11.7 en vez de 2.11.8).
**Descartado:** excluir paquetes de la regla para usar la última versión.
