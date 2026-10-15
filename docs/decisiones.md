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

### 2026-10-14 · Node 24 LTS
**Por qué:** el CLI de Nest 12 no corre en Node 23.8 (error de `require()` de módulos ES), y Node 23 ya no tiene soporte. Node 24 ("Krypton") es la LTS activa y la que ofrecen Vercel y Render. Se fija con `.nvmrc` y `engines`.
**Descartado:** Node 26, que todavía no es LTS. Armar la API sin el CLI de Nest para seguir en Node 23.

### 2026-10-14 · ESLint 9 y TypeScript 6 en vez de las últimas majors
**Por qué:** los plugins que trae `eslint-config-next` 16.4 (react, jsx-a11y, import) soportan hasta ESLint 9, y `typescript-eslint` pide TypeScript < 6.1. El CLI de Nest 12 también usa TypeScript 6. Se revisa cuando el ecosistema soporte ESLint 10 y TypeScript 7.
**Descartado:** ESLint 10 y TypeScript 7 con peer dependencies rotas.

### 2026-10-14 · API con la configuración por defecto de Nest 12
**Por qué:** ESM, oxlint para el lint y Vitest para los tests es lo que genera Nest 12; así se sigue el camino estándar. La API escucha en el puerto 4000 (`PORT`) y acepta CORS solo desde `WEB_ORIGIN` (por defecto `http://localhost:3000`).
**Descartado:** `@nestjs/mau` y el script `nest deploy`, porque Mau es un servicio pago (choca con la regla de costo cero). Pasar la API a ESLint ahora: se decide en la tarea de ESLint + Prettier.

### 2026-10-14 · `@kaname/shared` compilado a JS, con enums como `z.enum`
**Por qué:** la API corre en Node como ESM y no puede ejecutar TypeScript de otro paquete, así que `shared` se compila con `tsc` a `dist/` y Turborepo lo construye antes de `dev`, `lint`, `typecheck` y `build` de las apps. Cada enum del dominio es un `z.enum` que sirve como valor (`Currency.ARS`), como tipo y para validar. El dinero viaja como string decimal, nunca como `number`.
**Descartado:** exportar el código TypeScript sin compilar (`transpilePackages` en Next), porque funciona en la web pero no en la API. Usar los enums que genera Prisma también en la web, porque arrastra el cliente de Prisma al front.
**Riesgo conocido:** los enums están duplicados respecto de `schema.prisma` y hay que mantenerlos a mano. Se puede agregar un chequeo cuando Prisma esté en `apps/api`.

### 2026-10-14 · Prisma 7.10 y ajustes del schema para Prisma 7
**Por qué:** es la última estable (el tag `latest` de npm apunta a la 8.0.0-rc). Prisma 7 cambia la configuración, y el schema se ajustó así:
- generator `prisma-client-js` → `prisma-client`, con `output` en `src/generated/prisma` (ESM, imports `.js`). El cliente generado no se commitea y lo regenera la tarea `db:generate` de Turborepo.
- `url` sale del `datasource` y pasa a `prisma.config.ts`, que carga `.env` con dotenv. Se usa `process.env.DATABASE_URL` y no `env()`, para que `prisma generate` funcione sin `.env` (build, CI).
- El cliente se conecta con el driver adapter `@prisma/adapter-pg`, que en Prisma 7 es obligatorio.
- Los modelos y los enums no cambiaron.
**Descartado:** Prisma 8 (todavía es RC). Quedarse en Prisma 6 con `prisma-client-js`.

### 2026-10-14 · Postgres 18 en Docker, puerto 5434
**Por qué:** 18.6 es la última estable (la 19 está en beta). Se expone en el 5434 porque el 5432 y el 5433 ya están ocupados en la máquina de desarrollo. En producción (Neon) hay que usar la misma versión mayor.
**Descartado:** Postgres 15, la imagen que ya había descargada.

### 2026-10-14 · Seed inicial: roles y módulos por espacio
**Por qué:** roles del sistema con la misma matriz en todos los módulos: Dueño (todo), Colaborador (ver, crear y editar; no elimina), Cliente (solo ver). Módulos activos según el rubro: Tank Vault (12, sin proyectos ni presupuestos), Disanza (10, con compras e insumos), VISIÓ (8, con proyectos y presupuestos) y Shinka (6: clientes, proyectos, presupuestos, documentos, calendario y dashboard). Lucas es superadmin, dueño de la cuenta y miembro con rol Dueño en los 4 espacios. Todo se edita después desde la app.

### 2026-10-14 · Configuración de la API con `@nestjs/config`
**Por qué:** es el módulo estándar de Nest para leer `.env`. `PrismaService` toma `DATABASE_URL` de ahí y se conecta al iniciar la app, así que si la base no está disponible la API falla al arrancar, con un error claro.
**Descartado:** `process.loadEnvFile()` de Node, que es más simple pero no se integra con la inyección de dependencias ni con la validación de variables que se va a sumar.

### 2026-10-14 · `@kaname/ui` como código fuente, con tokens en CSS
**Por qué:**
- **Distribución:** el kit se consume como TypeScript y CSS sin compilar. Next lo compila con `transpilePackages` y Storybook lo va a compilar con su propio bundler. Así no hace falta un paso de build y Tailwind ve las clases del kit con `@source`.
- **Tokens:** son variables CSS (claro en `:root`, oscuro en `.dark`) y Tailwind v4 los expone con `@theme inline`.
- **Fondos suaves de estado:** en modo claro `tokens.md` no los define, así que se derivan con `color-mix` sobre el color de estado.
- **Fuentes:** el kit no carga fuentes, para no depender de Next. La app las carga con `next/font` y las pasa en `--kaname-font-display` y `--kaname-font-sans`.
- **Tema:** `ThemeProvider` usa next-themes, que solo depende de React, con la clase `.dark` y "sistema" por defecto.

**Descartado:** compilar el kit a `dist/` como `@kaname/shared`. Solo lo consumen bundlers, así que el build no aporta nada y obliga a resolver aparte el CSS y las directivas `"use client"`.

### 2026-10-14 · pnpm descarga Node 24 para los scripts (`devEngines.runtime`)
**Por qué:** una terminal abierta con otro Node (en este caso el 23.8 que quedaba en el PATH) rompía `pnpm dev` con un error confuso de Nest. Con `devEngines.runtime` y `onFail: "download"`, pnpm instala Node 24 como dependencia, lo fija en el lockfile y lo usa para todos los scripts del monorepo. El resultado es el mismo en cualquier terminal y en CI.
**Descartado:** depender solo de `.nvmrc` y `nvm use`, porque es fácil olvidarlo. Validar la versión y cortar con un mensaje, porque avisa pero no lo resuelve.

### 2026-10-14 · i18n con next-intl: prefijo solo para inglés
**Por qué:** español sin prefijo (`/productos`) e inglés con `/en` (`/en/productos`), con `localePrefix: "as-needed"`. Las páginas se prerenderizan por idioma (`generateStaticParams` + `setRequestLocale`), lo que encaja con Cache Components. Cada URL sirve tal cual para compartir. El `proxy.ts` elige el idioma por la URL, la cookie `NEXT_LOCALE` (la guarda el selector) o `Accept-Language`. Los mensajes viven en `apps/web/messages/{es,en}.json` y están tipados: una clave que no existe da error de compilación. Montos y fechas se formatean con `Intl` en es-AR / en-US (`intlLocale`), no con el código corto del idioma.
**Descartado:** prefijo siempre (`/es/...`), porque alarga las URLs del idioma principal. Idioma solo por cookie, porque con Cache Components obliga a renderizar todo en forma dinámica.
**Pendiente:** cuando haya login, usar `User.locale` como preferencia inicial.

### 2026-10-14 · El script de next-themes se marca como datos en el cliente
**Por qué:** al cambiar de idioma cambia el layout raíz y React vuelve a renderizar el `<script>` de next-themes en el cliente, lo que dispara el error "Encountered a script tag". `ThemeProvider` le pasa `type="application/json"` solo en el cliente. En el servidor sigue siendo JavaScript y evita el parpadeo del tema.
**Descartado:** escribir un script de tema propio, porque es más código para mantener por un aviso de desarrollo.

### 2026-10-14 · ESLint y Prettier compartidos; la API deja oxlint
**Por qué:**
- **Un solo linter:** la configuración de ESLint vive en `@kaname/eslint-config`, con cuatro variantes: `base`, `next`, `nest` y `react`. Todos los paquetes corren `eslint` por Turborepo.
- **API:** pasa de oxlint a ESLint para tener una sola configuración y las mismas reglas que el resto, y conserva `no-floating-promises` con chequeo de tipos.
- **Prettier:** hay uno solo, en la raíz, con la configuración por defecto (comillas dobles), así que la API dejó las comillas simples del template de Nest. `eslint-config-prettier` apaga las reglas de formato de ESLint.
- **Lo que no se formatea:** el markdown y el export de Stitch, porque son documentación escrita a mano.

**Descartado:** mantener oxlint en la API. Es más rápido, pero obliga a mantener dos configuraciones con reglas distintas. Correr Prettier como regla de ESLint, porque es más lento y los errores de formato se mezclan con los de lógica.

### 2026-10-14 · Revisión de la Fase 0: aislamiento por espacio en tablas hijas
**Por qué:** `ProductVariant` suma `workspaceId` (con índice y FK) porque se consulta directo por stock, costo y precio, y filtrar siempre por `Product` es fácil de olvidar. El resto de las tablas hijas (ítems, pagos, recetas, ítems de listas de precios, precios de mercado, snapshots) heredan el espacio del padre: se consultan a través de él, y toda FK cruzada (`variantId`, `customerId`, etc.) se valida contra el mismo espacio antes de guardar. La regla quedó escrita en `AGENTS.md` y `backend.mdc`.
**Descartado:** `workspaceId` en todas las tablas hijas, porque son más columnas para mantener iguales a las del padre sin ganar casi nada. Solo documentar, porque deja la tabla más consultada sin filtro propio.

### 2026-10-14 · Roles del sistema por clave y errores de validación por código
**Por qué:** `Role.isSystem` se reemplaza por `Role.systemKey` (`OWNER` / `COLLABORATOR` / `CLIENT`, único por cuenta). La UI muestra el nombre traducido (`Roles.<clave>`), así un Dueño ve "Owner" en inglés. Los roles propios siguen usando `name`. Los schemas de `@kaname/shared` devuelven códigos (`money_invalid`) en vez de texto, y la web los traduce con `Errors.<código>`.
**Descartado:** guardar los nombres traducidos en la base, porque obliga a una columna por idioma.

### 2026-10-14 · Montos acotados a Decimal(14, 2)
**Por qué:** `moneySchema` acepta hasta 12 enteros y 2 decimales y no acepta negativos. Para ajustes existe `signedMoneySchema`. Así un monto fuera de rango es un 400 de validación y no un 500 de la base.

### 2026-10-14 · Categorías únicas con `NULLS NOT DISTINCT`
**Por qué:** `@@unique([workspaceId, name, parentId])` no impedía dos categorías raíz con el mismo nombre, porque Postgres trata los `NULL` como distintos. La migración recrea el índice con `NULLS NOT DISTINCT` (Postgres 15 o más). Prisma no modela esa opción, así que está en el SQL de la migración y comentada en el schema.

### 2026-10-14 · Preparación para producción en la API
**Por qué:**
- **CORS:** `WEB_ORIGIN` es obligatoria (la API no arranca sin ella) y acepta varios orígenes separados por coma, para producción y previews.
- **Apagado:** `enableShutdownHooks` cierra Prisma cuando Render apaga el servicio.
- **Conexiones:** las migraciones usan `DIRECT_URL` (Neon sin pooler) y la app usa `DATABASE_URL` (con pooler).
- **Dependencias:** `prisma` y `dotenv` pasan a `dependencies`, porque las usan el `postinstall` y `migrate deploy`.
- **Base local:** Postgres publica el puerto solo en `127.0.0.1`.
- **`minimumReleaseAge: 1440` explícito:** el valor por defecto de pnpm no es estricto y agrega las versiones nuevas a `minimumReleaseAgeExclude` sin avisar. Declarado, pnpm frena.

### 2026-10-15 · Componentes específicos del UI Kit pasan a la fase de su módulo
**Por qué:** PermissionsMatrix, WidgetFrame, CalendarEventChip y FormulaEditor dependen de cómo termine cada módulo (permisos, dashboards, calendario, calculadora). Diseñarlos en la Fase 0.5 obliga a adivinar su API. Se hacen en la fase de su módulo (Fase 5 y Fase 7), igual que antes: en `packages/ui` y con su story antes de usarse en `apps/web`.
**Descartado:** dejarlos en la Fase 0.5, porque es probable que haya que rehacerlos cuando exista el módulo.

### 2026-10-15 · Storybook 10 con Vite para el UI Kit
**Por qué:** `@storybook/react-vite` arranca rápido y usa el mismo Tailwind v4 que la web (`@tailwindcss/vite`). El tema se cambia con `@storybook/addon-themes`, que pone `.dark` en `<html>` como `ThemeProvider`. El idioma va en la barra como `globals.locale`: el kit no traduce, así que las stories toman sus textos de un diccionario propio (`src/stories/messages.ts`) y los pasan por props. Las fuentes se cargan con un `<link>` a Google Fonts, porque `next/font` solo funciona en Next.
**Descartado:** `@storybook/nextjs`, porque ata el kit a Next. Meter next-intl en Storybook también, porque el kit no puede depender de él.

### 2026-10-15 · Clase `.light`, `cn` y `cva` en el kit
**Por qué:** `.light` fuerza los tokens claros dentro de un contenedor oscuro, así se ven los dos temas lado a lado en una story. `cn` (clsx + tailwind-merge) y `cva` son los helpers de shadcn/ui que van a usar todos los componentes.

### 2026-10-15 · Claves de ModuleKanji
**Por qué:** usa los valores de `ModuleKey` más `GENERAL`, `STOCK` y `ADMIN`, que tienen kanji pero no son módulos activables. Así la web le pasa `module.key` directo. El kit declara su propio tipo en vez de importar `@kaname/shared`, para no depender del paquete del dominio.

### 2026-10-15 · Display con dos pesos: 800 y 600
**Por qué:** con dos pesos la jerarquía de títulos se nota más y la web descarga una variante menos de Shippori Mincho B1. 800 para h1; 600 para h2, h3, nombres de espacio y acentos kanji.
**Descartado:** usar 600, 700 y 800, porque 700 y 800 casi no se distinguen en pantalla.

### 2026-10-15 · Componentes base del kit sobre `radix-ui`
**Por qué:** los componentes de shadcn/ui se copian al kit y se adaptan a los tokens. Las primitivas vienen del paquete unificado `radix-ui`, que es el que usa shadcn hoy: una sola dependencia y versiones alineadas. Criterios de color:
- **Hover:** primario y destructivo bajan al 90%; secundario y ghost suman `foreground/8`.
- **Destructivo:** el texto va en `text-background`, que pasa AA sobre el rojo en los dos temas (5.0 en claro, 6.9 en oscuro).
- **Badges de estado:** texto en `foreground` sobre el fondo suave y el color en el borde, porque el verde (4.4), el ámbar (2.6) y el rojo (4.4) como texto no llegan a AA en el tema claro.
- **`IconButton`:** `label` es obligatorio y va como `aria-label`.
**Descartado:** los paquetes `@radix-ui/react-*` por separado.

### 2026-10-15 · Hover y foco forzados en Storybook
**Por qué:** la regla del kit pide mostrar el hover y el foco en las stories. `storybook-addon-pseudo-states` (oficial de Storybook) los fuerza por selector. Tailwind v4 mete el hover en `@media (hover: hover)` y el addon no reescribe reglas dentro de `@media`, así que en el CSS de Storybook se redefine `hover` sin la media query. La app no cambia.

### 2026-10-15 · Controles de formulario del kit
**Por qué:**
- **Combobox:** Popover + `cmdk`, como el de shadcn/ui. Busca por etiqueta y por `keywords` (SKU, alias).
- **DatePicker y Calendar:** `react-day-picker` 10, con estilos de Tailwind en vez de su CSS. El locale entra como string BCP 47 ("es-AR"). Por ahora el calendario traduce español e inglés.
- **FormField:** pasa id, `aria-labelledby`, `aria-describedby`, `aria-invalid` y `aria-required` por un contexto que leen los controles del kit. Así funciona aunque el control esté anidado, como el `SelectTrigger` dentro de `Select`.
- **Componentes extra:** Label, Popover y Calendar, porque los necesitan FormField, Combobox y DatePicker.
- **`"use client"`:** lo llevan los módulos del kit que usan hooks o contexto, porque la web importa el kit desde Server Components.
**Descartado:**
- `@daypicker/react`: es un envoltorio del mismo `react-day-picker` 10.0.2.
- Un `Slot` en FormField: la raíz de Radix Select no renderiza nada en el DOM y los atributos se perdían.

### 2026-10-15 · MoneyInput y PercentInput con string decimal
**Por qué:** el valor es el mismo string que valida `moneySchema` ("1234.5": hasta 12 enteros y 2 decimales), nunca un `number`.
- **Edición:** mientras el campo tiene foco se edita sin separador de miles; al salir se formatea con `Intl.NumberFormat` según el locale (es-AR: 1.234,50).
- **Separadores:** el último "." o "," es el decimal y los anteriores se descartan como miles. Así funcionan el punto del teclado numérico y pegar "1.234,56".
- **Tests:** el parseo tiene tests con Vitest en `@kaname/ui`.
**Descartado:** formatear con miles mientras se escribe, porque obliga a recalcular la posición del cursor en cada tecla.
