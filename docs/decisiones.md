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
- **Separadores (según el locale):** en es-AR "." es miles y "," decimal; en en-US al revés. Se ignora lo que no sea dígito o separador ("$", espacios).
  - Un separador que aparece más de una vez es de miles. Si aparecen los dos, el último es el decimal ("1.234,56", "1,234.56").
  - Si solo aparece el del otro locale, una sola vez: con exactamente 3 dígitos después es miles ("12.000" → 12000 en es-AR); con 1 o 2, decimal ("12.5" → 12.5).
  - La tecla "." del teclado numérico escribe el separador decimal del locale mientras se escribe ("12." pasa a "12,").
  - *Corrección (revisión de la Fase 0.5):* antes el último separador era siempre el decimal, y pegar "12.000" guardaba 12.00 sin aviso.
- **Tests:** el parseo tiene tests con Vitest en `@kaname/ui`.
**Descartado:** formatear con miles mientras se escribe, porque obliga a recalcular la posición del cursor en cada tecla.

### 2026-10-15 · Overlays del kit: Dialog, Sheet, DropdownMenu, Tooltip, Toast y Tabs
**Por qué:**
- **Animaciones:** keyframes propios en `theme.css` (`animate-enter` / `animate-exit`) parametrizados con variables (`--kaname-enter-x`, `--kaname-exit-opacity`...), solo con `motion-safe`. Animan Dialog, Sheet y Toast, donde el movimiento indica de dónde sale el panel. DropdownMenu y Tooltip quedan sin animación, como Popover y Select.
- **Dialog:** se centra con `inset-0 m-auto` en vez de `translate`, así la escala de la animación no pisa el centrado. El velo es `bg-black/50` fijo: con un token del tema quedaría claro en oscuro.
- **Botón de cerrar:** la X de Dialog, Sheet y Toast es un `IconButton` y solo aparece si se pasa `closeLabel`, porque el kit no tiene textos propios.
- **Sheet:** sobre el Dialog de Radix, con `side` (derecha, izquierda, arriba, abajo) y un `SheetBody` que scrollea entre header y footer fijos.
- **Toast:** el de Radix más un store chico con `useSyncExternalStore`: `<Toaster>` en el layout y `toast({ ... })` desde cualquier lado. Los errores se anuncian con prioridad (`type="foreground"`). Colores como los badges: texto en `foreground`, el estado en el borde y el ícono.
- **DropdownMenu:** el ítem destructivo pinta el ícono y el fondo, no el texto, porque el rojo como texto no pasa AA en claro.
- **Tabs:** variantes `pill` (alternar vistas) y `line` (secciones de una página).
**Descartado:**
- `sonner` para los toasts y `tw-animate-css` para las animaciones: dos dependencias más para lo que resuelven `radix-ui` y unos keyframes.

### 2026-10-15 · Componentes de datos del kit y Recharts
**Por qué:**
- **Formato:** `formatMoney`, `formatDate` y `formatChange` en `lib/format.ts`, con tests, usados por MoneyText, DateText, KpiCard y ChartCard. Los montos entran como string decimal y van directo a `Intl` sin pasar a `number`.
- **`MoneyCurrency`:** vive en `lib/format.ts` y lo importan MoneyInput, MoneyText y ChartCard. No se usa el `Currency` de `@kaname/shared`, para que el kit siga sin depender del paquete del dominio; los valores coinciden, así que la web le pasa el de shared directo.
- **Fechas:** una fecha sin hora ("2026-10-24") se formatea en UTC para que no se corra al día anterior en Argentina. Las fechas con hora conviene pasarlas con `timeZone`, así servidor y navegador muestran lo mismo. En español la hora va en 24 h, porque ICU formatea es-AR con 12 h ("p. m.").
- **StatusBadge:** recibe un tono y el texto por `label`. `OrderStatusBadge` y `PaymentStatusBadge` traducen el estado del dominio a un tono. El kit declara las claves como tipos propios, igual que ModuleKanji. Pedido: borrador neutro, pendiente acento, confirmado y en camino info, preparando advertencia, entregado éxito, cancelado error. Cobro: sin cobrar advertencia, parcial acento, cobrado éxito, reintegrado neutro. Badge suma la variante `info` (borde primario, fondo primario al 10%).
- **KpiCard:** la variación muestra flecha y signo, y el color dice si es buena o mala. `invert` da vuelta el color para métricas donde bajar es bueno.
- **ChartCard:** Recharts 3 con `responsive` y los colores como variables CSS (`var(--primary)`), así sigue al tema del contenedor. Todas las props son serializables (el formato se elige con `format`, sin funciones) para usarlo desde Server Components. `react-is` va alineado con React 19, como pide Recharts, porque pnpm resolvía la 17.
**Descartado:**
- `ResponsiveContainer`: Recharts 3.10 trae `responsive` en el gráfico.
- `ComposedChart` para todos los tipos: dibuja el cursor de las barras como línea en vez de franja.
- Fechas relativas ("Hoy, 14:32"): dependen de la hora actual y dan diferencias de hidratación. Si hacen falta, van como componente cliente aparte.

### 2026-10-15 · DataTable sobre TanStack Table 9
**Por qué:**
- **Versión:** `@tanstack/react-table` 9.3.1, la última que cumple `minimumReleaseAge`. La API cambió respecto de la 8: `useTable` con features explícitas (`tableFeatures`) en lugar de `useReactTable` con todo incluido. Solo se registran orden, filtros por columna, búsqueda global, paginación y selección.
- **Todo en el cliente:** orden, filtros y paginación corren en el navegador. Para listas que no entren en memoria habrá que sumar el modo manual (server-side).
- **Búsqueda:** ignora mayúsculas y tildes ("pokemon" encuentra "Pokémon"), con el filtro de ejemplo de la propia librería.
- **Columnas:** se arman con `createDataTableColumnHelper`, ya tipado con las features del kit. `meta.numeric` alinea a la derecha con `tabular-nums`, pero no cambia el orden.
- **Montos:** el accessor de una columna de montos tiene que devolver `Number(...)`. Con el string decimal se ordenaría como texto ("85000" queda después de "345000"). La celda muestra el string original con MoneyText, así no se pierde precisión al mostrar. Está documentado en el JSDoc de `meta.numeric`.
- **`getRowId` obligatorio:** la selección y las acciones masivas operan sobre el id real de cada fila (el de la base), nunca sobre el índice. Un índice cambia al ordenar, filtrar o paginar, y una acción masiva podría aplicarse a la fila equivocada.
- **Textos:** todos por `labels`. Los que llevan números (`selected`, `pageInfo`, `pageOf`) son funciones, para que la web use el plural de next-intl. Por las funciones de las columnas, la página que usa DataTable es un componente cliente.
- **Table:** la tabla HTML con estilos (adaptada de shadcn/ui) vive aparte, en `Table`, y DataTable se arma sobre ella.
- **Vacíos:** sin datos se muestra `emptyState` y se ocultan el buscador, los filtros y el pie. Sin resultados aparece un EmptyState con "Limpiar filtros".
**Descartado:**
- TanStack Table 8: es la versión anterior y la 9 ya cumple la regla de antigüedad.
- `stockFeatures`: registra todas las features de la librería.
- Aprobar las "skills" que ofrece el paquete (`pnpm approve`): no hacen falta para usarlo. Quedan rechazadas en `permissions` de `pnpm-workspace.yaml`, así pnpm no vuelve a preguntar.
- Botones numerados de página como en Stitch: por ahora anterior/siguiente y "Página X de Y".

### 2026-10-15 · Layout del kit y acento por espacio
**Por qué:**
- **Acento por espacio:** el contenedor lleva `data-workspace-accent` y `--workspace-color`, y una regla de `tokens.css` deriva `--accent` y `--accent-soft`. En oscuro el color se aclara con `color-mix` hacia blanco. La cantidad de aclarado la define cada tema con una variable, así manda el `.light`/`.dark` más cercano (los paneles lado a lado de las stories incluidos). Se aplica con `AppShell accentColor`, `WorkspaceAccent` o `workspaceAccentProps`.
- **Color validado:** solo se acepta `#rrggbb`. El color lo carga el usuario y termina en un `style` inline; cualquier otra cosa se ignora y queda el acento por defecto.
- **Texto sobre el acento:** WorkspaceAvatar y los badges usan el fondo suave y el borde del color, con texto en `foreground`, porque el color elegido puede no tener contraste como texto.
- **Composición con `asChild`:** SidebarItem, BreadcrumbLink, WorkspaceTile y los espacios de WorkspaceSwitcher (prop `link`, desde la revisión de la Fase 0.5) envuelven el `<Link>` de la app en lugar de recibir un componente de link por props. Las funciones y los componentes no pasan de un Server Component a uno cliente; los elementos sí.
- **AppShell:** guarda el estado del sidebar (colapsado en escritorio, drawer en mobile) en un contexto. `collapsed` y `onCollapsedChange` permiten guardar la preferencia en una cookie. Incluye "Saltar al contenido".
- **Sidebar colapsado:** muestra el kanji de cada módulo (tokens.md), con el nombre en un tooltip y en texto oculto para lectores de pantalla. Expandido muestra ícono y nombre, con el kanji solo en el ítem activo.
- **TopBar:** es solo la estructura (`TopBar` + `TopBarActions`). Búsqueda, idioma, tema y usuario los arma la app con componentes del kit, porque dependen de next-intl, next-themes y la sesión.
**Descartado:**
- Pasar `linkComponent` al Sidebar: no funciona desde Server Components.
- Una columna de íconos global más un sidebar por espacio, como en Stitch: dos barras ocupan mucho. El WorkspaceSwitcher arriba del sidebar cubre el cambio de espacio.

### 2026-10-15 · Colores de gráficos separados del acento del espacio
**Por qué:** ChartCard usaba `--accent` para la serie 2. Con el acento por espacio, cada espacio pintaba su gráfico de otro color, y un acento azul se confundía con la serie 1. Los gráficos usan ahora `--chart-1` (Ruri-iro / Wasurenagusa-iro, el primary) y `--chart-2` (Momo-iro / Toki-iro), que define cada tema y no cambian con `Workspace.color`. El acento del espacio queda solo para identidad: ítem activo, kanji, badges y avatar. `ChartColor` cambia `primary` y `accent` por `chart-1` y `chart-2`. Tank Vault tiene su color en las stories.
**Descartado:** dejar `--accent` en los gráficos y pedir que los espacios no elijan colores parecidos al primary, porque depende de lo que cargue el usuario.

### 2026-10-15 · Sidebar: ícono + kanji, expansión superpuesta
**Por qué:** reemplaza el sidebar colapsado de solo kanji con tooltips.
- **Formato:** cada ítem es ícono + kanji + nombre, en columnas fijas. Colapsado (100 px) se ven el ícono y el kanji; fijado expandido (256 px), los tres.
- **Expansión superpuesta:** con el mouse (después de 150 ms, para que no se abra al pasar de largo) o con foco de teclado (`:focus-visible`), el sidebar colapsado se expande superpuesto al contenido. Un espaciador de 100 px queda en el layout, así no se mueve nada. Al salir vuelve a colapsar. Mientras el menú de espacios está abierto se mantiene expandido.
- **Ícono y kanji quietos:** el contenido se arma siempre a 256 px y el nav lo recorta. Lo que solo se ve expandido (nombres, títulos de grupo, texto del selector de espacio) pasa de `opacity-0` a visible, sin cambiar de lugar.
- **Accesibilidad:** el kanji es decorativo (`aria-hidden`). El ícono y el nombre traducido tienen que estar siempre accesibles: el ícono siempre se ve y el nombre nunca sale del árbol de accesibilidad (`opacity-0`, no `display: none`), así los lectores de pantalla lo leen también colapsado.
**Descartado:** los tooltips por ítem. El nombre tardaba en aparecer, había que recorrer los ítems uno por uno para leerlos y el ícono no se veía.

### 2026-10-15 · Página /ui-kit, ThemeToggle en el kit y textos por ruta
**Por qué:**
- **Solo en desarrollo:** `/[locale]/ui-kit` llama a `notFound()` si `NODE_ENV` es `production`. El build la prerenderiza como 404 y `generateMetadata` no da título en producción, así el 404 no menciona la vitrina.
- **Fuera del build (revisión de la Fase 0.5):** la vitrina se importa con `import()` dentro de la rama de desarrollo. En producción esa rama es código muerto y el bundler la descarta, así que su código no llega ni a los chunks públicos ni al servidor. `next/dynamic` no sirve para esto: desde un Server Component no divide el código de un Client Component.
- **Textos por ruta:** el layout le pasa a `NextIntlClientProvider` todos los mensajes menos `UiKit`. `/ui-kit` envuelve la vitrina en su propio provider, que recibe todos. Así los textos de la vitrina no viajan a las demás páginas.
- **ThemeToggle en el kit:** menú claro / oscuro / sistema sobre el ThemeProvider del kit, con los textos por props. Hasta montar no marca ninguna opción, así no hay diferencias de hidratación. Reemplaza el botón temporal de la web, y el selector de idioma pasa a usar el Select del kit (los dos eran controles con estilos propios en la página).
- **Íconos en la web:** `lucide-react` en la misma versión que el kit, para los íconos que la web le pasa a los componentes.
**Descartado:** excluir la ruta del build con `pageExtensions` por entorno, porque es más indirecto que el `notFound()` y obliga a nombrar los archivos de otra forma.

### 2026-10-15 · Token `muted-foreground` para texto secundario
**Por qué:** la revisión de la Fase 0.5 encontró textos debajo de AA en el tema claro. Los placeholders (`foreground/55`) daban 3.7:1 y los textos chicos en `foreground/60` (título de grupo del sidebar, atajos del menú, SKUs) daban 4.3:1. `muted-foreground` vale `#676774` en claro (5.6:1 sobre card y al menos 4.8:1 sobre los fondos de hover) y `#AEB0BE` en oscuro (6.8:1). Los placeholders y esos textos pasan a usarlo. `foreground/70` (5.9:1) queda para descripciones.
**Descartado:** subir cada uso a `foreground/70` por separado, porque un token deja la regla en un solo lugar y se puede ajustar por tema.

### 2026-10-16 · Autenticación propia en la API (email y contraseña)
**Por qué:**
- **Contraseñas:** argon2id con los parámetros mínimos de OWASP (19 MiB, 2 iteraciones, 1 hilo), con `@node-rs/argon2`. Trae binarios precompilados y no necesita scripts de build, que en el repo están bloqueados (`allowBuilds`).
- **Error genérico:** si el email no existe o no tiene contraseña (solo Google), se verifica igual contra un hash de relleno. La respuesta es la misma (`invalid_credentials`) y tarda lo mismo, así no revela qué emails están registrados.
- **Access token:** JWT HS256 de 15 min con `sub` (usuario) y `sid` (sesión), firmado con `JWT_ACCESS_SECRET`. El guard verifica además que la sesión siga viva: un logout o una revocación cortan el acceso al instante, a cambio de una consulta por pedido.
- **Refresh token:** opaco, `<sessionId>.<secreto>`, 30 días. En `Session.refreshTokenHash` se guarda el SHA-256 del secreto: son 32 bytes al azar, no hace falta un hash lento. Rota en cada uso con un `updateMany` condicionado al hash anterior, así la rotación es atómica. El vencimiento se corre 30 días con cada uso: una sesión sin usar 30 días se cae.
- **Reutilización:** si llega un refresh de una sesión que existe pero con otro secreto, es uno ya rotado y se revocan todas las sesiones del usuario. El id dentro del token permite detectarlo sin cambiar el schema. Dos refresh en paralelo con el mismo token cuentan como reutilización: la web tiene que hacer un solo refresh a la vez.
- **Cookies:** las dos httpOnly y SameSite=Lax, y Secure con `NODE_ENV=production`. Las dos van en `Path=/`: el refresh también, porque el proxy de Next lo lee en cada navegación para renovar la sesión del lado del servidor (corregido el 2026-10-27: el refresh empezó en `Path=/api/auth` y pasó a `Path=/` cuando la web empezó a renovar la sesión en el proxy; esta entrada decía `Path=/auth`). CORS con `credentials` para los orígenes de `WEB_ORIGIN`.
- **Rate limit:** `@nestjs/throttler` solo en `POST /auth/login`: 5 intentos por IP por minuto (`LOGIN_RATE_LIMIT`, `LOGIN_RATE_WINDOW_SECONDS`), con almacenamiento en memoria (una instancia). Detrás de un proxy hay que fijar `TRUST_PROXY` para que cuente la IP real.
- **Entorno:** las variables se validan con zod al arrancar (`src/config/env.ts`). Si falta una, la API no levanta y dice cuál.
- **Errores y validación:** el body se valida con `loginSchema` de `@kaname/shared`. Los errores salen como códigos (`invalid_credentials`, `unauthenticated`, `too_many_attempts`, `validation_failed`...) que la web traduce con `Errors.<código>`.
- **Tests:** una sola suite del flujo por HTTP (`test/support/auth-flow.ts`) corre dos veces. En `pnpm test` usa un Prisma en memoria (sin base); en `test:e2e`, Postgres real.
**Pendiente para el deploy:** SameSite=Lax no manda las cookies entre sitios distintos, y `*.vercel.app` y `*.onrender.com` son sitios distintos. En producción la web tiene que llamar a la API a través de su propio dominio (rewrite de Next a la API) o compartir el dominio con subdominios.
**Descartado:**
- Paquete `argon2`: necesita un script de build.
- Refresh token como JWT: no se puede revocar ni rotar sin estado.
- Guardar el refresh con argon2: es lento sin aportar nada con 32 bytes al azar.
- Rate limit global: por ahora solo el login lo necesita.

### 2026-10-16 · Auth: prefijo /api, rate limit por email, margen de refresh, registro y seed
**Por qué:**
- **Prefijo `/api`:** todas las rutas de Nest cuelgan de `/api` (`setGlobalPrefix`), así son iguales en desarrollo y en producción. En producción Next va a reenviar `/api/*` a la API: la web y la API quedan en el mismo sitio y las cookies SameSite=Lax viajan (resuelve el pendiente de deploy de la entrada anterior). La cookie de refresh pasa a `Path=/api/auth` y el health a `/api/health`. CORS queda solo para cuando la web llama directo, sin el proxy.
- **Rate limit por email:** además del límite por IP (5 por minuto), hay uno por email: 10 intentos cada 15 minutos (`LOGIN_EMAIL_RATE_LIMIT`, `LOGIN_EMAIL_RATE_WINDOW_SECONDS`). Frena un ataque a una cuenta desde muchas IPs. El tracker normaliza el email igual que `loginSchema`; sin email cuenta por IP. Contra: alguien puede bloquear el login de una cuenta 15 minutos a propósito. Se acepta frente a la fuerza bruta distribuida.
- **IP detrás del proxy:** con el proxy de Next hay que usar `TRUST_PROXY=1`, y Next tiene que reenviar `X-Forwarded-For` (paso 2 de la Fase 1). Si no, el límite por IP ve siempre la IP del servidor de Next.
- **Refresh concurrente:** `Session` guarda `previousTokenHash` y `rotatedAt`. Si llega el refresh anterior dentro de los 30 s siguientes a la rotación (dos pestañas o pedidos en paralelo), se responde 401 sin revocar nada. Pasado el margen, o con cualquier otro secreto viejo, se revocan todas las sesiones como antes. Si dos pedidos rotan a la vez (falla el `updateMany` condicionado), también es 401 sin revocar.
- **Registro:** `POST /api/auth/register` existe pero responde 403 (`registration_disabled`) salvo que `REGISTRATION_ENABLED` sea `"true"`. Se chequea antes de validar el body. Habilitado, crea el usuario (nombre, email, contraseña de al menos 12 caracteres, sin reglas de composición: NIST 800-63B) e inicia la sesión. Comparte el rate limit del login y devuelve `email_taken` si el email existe. Todavía no crea la cuenta (tenant): eso va con el alta de espacios.
- **Contraseña del seed:** sale de `SEED_ADMIN_PASSWORD`, con al menos 12 caracteres. Sin la variable el usuario queda sin contraseña y el seed avisa. Es inicial: si el usuario ya tiene contraseña, no se pisa.
- **Tests:** las variables de entorno de los tests se fijan en un `setupFiles` de vitest, porque ConfigModule las valida al importarse. El registro habilitado tiene su propio archivo con `vi.hoisted`. El rate limit por email se prueba con IPs distintas en `X-Forwarded-For` (`TRUST_PROXY=1` en los tests).
**Descartado:**
- Margen de refresh por configuración: 30 s fijos alcanzan para pedidos en paralelo.
- Pisar la contraseña en cada seed: cambiaría una contraseña ya elegida.

### 2026-10-16 · Login en la web: proxy a la API, sesión en el servidor y en el cliente
**Por qué:**
- **Proxy a la API:** `next.config.ts` reenvía `/api/*` a `NEST_URL` (rewrite `beforeFiles`). El navegador siempre llama al mismo origen, así las cookies SameSite=Lax viajan también en producción.
- **IP del cliente:** el rewrite de Next no agrega `X-Forwarded-For`; Next solo lo completa si falta, así que pasaba el que mandara el cliente y se podía falsear. `src/proxy.ts` lo borra en cada pedido a `/api/*` y lo vuelve a poner con la IP del header que configure `CLIENT_IP_HEADER`, el que pone el proxy de adelante (en Vercel, `x-real-ip`). Sin ese header (en local) no se confía en nada que mande el cliente y la API ve la IP de Next, que en local es la del usuario. La API usa `TRUST_PROXY=1`; en producción hay que contar también el proxy de Render.
- **Cookie de refresh con `Path=/`:** antes iba en `/api/auth`. La navegación a páginas no la mandaba y el proxy de Next no podía renovar la sesión del lado del servidor cuando vencía el access: cada página después de 15 minutos habría terminado en `/login`. Sigue siendo httpOnly y SameSite=Lax.
- **Renovación en el servidor:** el proxy decodifica el `exp` del access sin verificarlo. Si faltan menos de 30 s o ya no está, renueva con el refresh antes de renderizar. Las cookies nuevas van en la respuesta y Next las pasa al render del mismo pedido, así los Server Components ya ven el access nuevo. Hace un solo refresh por token: los pedidos simultáneos de una navegación (página, prefetch, RSC), o los que llegan hasta 30 s después, comparten el resultado. Es por proceso; entre instancias queda el margen de 30 s de la API.
- **Renovación en el cliente:** `createApiClient` reintenta un pedido que vuelve con 401 después de un solo refresh compartido. Si el refresh falla, va a `/login?next=...` una sola vez. `SessionKeeper` consulta `/api/auth/me` al volver a la pestaña.
- **Rutas:** el proxy manda a `/login?next=<ruta>` todo lo que no sea `/login` o `/register` cuando no hay sesión. Con sesión, `/login` vuelve a `next`, que solo acepta rutas del mismo sitio. En `/login` la sesión se confirma con `/api/auth/me`: un access vigente de una sesión revocada no puede mandar al inicio, porque el inicio lo devolvería a `/login` en bucle.
- **Sesión en las páginas:** el usuario se lee detrás de `<Suspense>` (guía de Next "Authentication with Cache Components"); los layouts no esperan la sesión en el nivel superior. Cada layout llama a `setRequestLocale`, porque si no next-intl lee los headers fuera de `<Suspense>`.
- **Registro:** "Registrate" y `/register` aparecen solo si la API dice `registrationEnabled` (`GET /api/auth/options`). Así hay una sola fuente de verdad, `REGISTRATION_ENABLED` de la API.
- **Kit:** se suman `KanameLogo`, `PasswordInput` (mostrar u ocultar, con `aria-pressed`), `Alert` (errores con `role="alert"`) y `UserMenu`, con sus stories.
- **Vencimiento configurable:** `ACCESS_TOKEN_TTL_SECONDS` (15 min por defecto, mínimo 30 s) sirve para probar la renovación sin esperar 15 minutos.
- **Tests:** los e2e de la API corren contra `kaname_test`: se crea y migra sola, y el setup se niega a usar una base cuyo nombre no termine en `_test`. La web suma vitest para la lógica de sesión: next seguro, vencimiento, un solo refresh en el servidor y en el cliente.
- **`/ui-kit`:** `instant = false`. La validación de navegación instantánea no puede instanciar la vitrina importada con `import()`, que es lo que la deja fuera del build de producción.
**Descartado:**
- Dejar el refresh en `/api/auth` y renovar con una redirección por página: con los prefetch habría varias en paralelo con el mismo token.
- Repetir `REGISTRATION_ENABLED` en la web.
- "Recordar este dispositivo" del diseño de Stitch: la sesión ya dura 30 días.

### 2026-10-27 · Permisos en la API: guards globales por decorador
**Por qué:**
- **Tres guards globales** (`APP_GUARD` en AppModule, en orden): sesión, membresía del espacio y permiso. Un endpoint se protege con decoradores, sin `@UseGuards`, y lo que no declara nada exige sesión. Así olvidarse de algo deja la ruta más cerrada, no más abierta.
- **`@Public()`:** solo login, registro, refresh, logout, options y health. Logout también, porque tiene que funcionar con el access vencido (usa el refresh); si no, las cookies quedan colgadas.
- **Membresía:** `@WorkspaceMember()` o `@RequirePermission(...)` en rutas con `:workspaceId`. Sin membresía o con un espacio inexistente: 404, la misma respuesta en los dos casos, para no revelar que existe.
- **Falla cerrado:** una ruta con `:workspaceId` sin ninguno de los dos decoradores responde 403 y queda en el log.
- **Permiso:** `@RequirePermission(ModuleKey.X, acción)`. Con el módulo apagado en el espacio (`WorkspaceModule.enabled`), 404: para el usuario ese módulo no existe. Si el rol no tiene la acción en `RolePermission`, 403.
- **Superadmin:** `User.isSuperadmin` no da acceso a datos de negocio. El acceso sale solo de `WorkspaceMember`, ni siquiera del dueño de la cuenta; la administración de plataforma va a tener sus propias rutas.
- **Una consulta por pedido:** `WorkspaceAccessRepository` trae membresía, rol, matriz de permisos y módulos activos juntos y los deja en `request.workspace` (`@CurrentWorkspace()`). Los servicios filtran por ese `workspaceId`; el guard valida el espacio, no cada registro.
- **Endpoints:** `GET /api/workspaces` (mis espacios no archivados, con rol, módulos activos y permisos) y `GET /api/workspaces/:workspaceId` (incluye archivados, para poder restaurarlos).
- **Tests:** una suite por HTTP con rutas de prueba (`test/support/permission-routes.ts`) corre en memoria (repositorio doble) y contra `kaname_test`, con dos cuentas, los tres roles del sistema y un módulo apagado.
**Pendiente:** `WorkspaceMember.roleId` es RESTRICT. Protege de borrar un rol en uso, pero también impide borrar una cuenta en cascada mientras tenga miembros. Habrá que resolverlo cuando exista la baja de cuentas.
**Descartado:**
- `@UseGuards(WorkspaceGuard)` en cada controller: depende de acordarse.
- Acceso total del superadmin: rompe el aislamiento entre clientes del SaaS.
- 403 para espacios ajenos: revela que existen.

### 2026-10-27 · Cambio de tema con círculo (View Transitions)
**Por qué:** al cambiar el tema desde el ThemeToggle, el tema nuevo aparece en un círculo que crece desde el centro del botón hasta la esquina más lejana: 450 ms, ease-in-out, en los dos sentidos.
- **Cómo:** con `document.startViewTransition` y un `clip-path: circle()` animado sobre `::view-transition-new(root)`, sin dependencias nuevas (`lib/theme-transition.ts`). Mientras dura, `<html>` lleva `data-theme-transition` y `theme.css` apaga el fundido por defecto de View Transitions, así se ve solo el círculo. Otras View Transitions de la app no se tocan.
- **next-themes sigue siendo el único que escribe el tema:** aplica la clase en un efecto de React, así que la transición llama a `setTheme` y espera, con un `MutationObserver` y un tope de 300 ms, a que `<html>` tenga la clase nueva antes de capturar la vista nueva.
- **Sin animación:** si el navegador no soporta View Transitions, si el sistema pide menos movimiento (`prefers-reduced-motion`) o si el tema que queda es el mismo (por ejemplo, "sistema" cuando el sistema ya está en ese tema), el tema cambia al instante.
**Descartado:** aplicar la clase de `<html>` a mano en la transición, porque duplicaría la lógica de next-themes y en Storybook pelearía con el selector de tema.

### 2026-10-27 · Un espacio archivado responde 404
**Por qué:** reemplaza lo que decía la entrada de permisos: `GET /api/workspaces/:workspaceId` devolvía también los espacios archivados. Ahora `WorkspaceAccessRepository` los excluye en la consulta: entrando directo a un espacio archivado, o a cualquier ruta de negocio debajo, la respuesta es 404, la misma que para uno inexistente. Un espacio archivado deja de usarse del todo; la restauración va a ser una acción aparte, de la cuenta, cuando exista el alta y baja de espacios (Fase 2).
**Descartado:** dejarlo accesible solo para lectura, porque obligaría a cada endpoint a distinguir archivados.

### 2026-10-27 · Recuperación de contraseña con Resend
**Por qué:**
- **Token:** 32 bytes al azar, solo en el link del email; en `PasswordResetToken` se guarda el SHA-256. Sirve una vez y vence a los 30 minutos. Pedir otro link borra los pendientes del usuario. Usarlo cambia la contraseña (argon2id), invalida los demás links y cierra todas las sesiones en una transacción. El token se reclama con un `updateMany` condicionado a `usedAt = null`, así dos pedidos simultáneos no lo usan dos veces.
- **Sin revelar emails:** `POST /api/auth/forgot-password` siempre responde 202, enseguida, y busca al usuario, crea el token y manda el email en segundo plano. Así tampoco el tiempo de respuesta delata si el email existe. Un link vencido, usado o inventado da el mismo código: `reset_token_invalid`.
- **Rate limit:** los dos endpoints usan los mismos throttlers que el login (por IP y por email).
- **Resend sin SDK:** la API REST es un solo POST con `fetch`. El plan gratis alcanza. Sin `RESEND_API_KEY` (o vacía), fuera de producción el email se escribe en la consola de la API con el link; en producción la clave es obligatoria y la API no arranca sin ella.
- **Email:** HTML con tablas y estilos en línea (lo que respetan los clientes de correo), el logo 要 Kaname como texto (sin imágenes que bloquear), colores de tokens.md y versión en texto plano. Se escapa todo lo que entra por parámetro. Los textos viven en la API, en es/en según `User.locale`, porque el email no pasa por next-intl.
- **Web:** `/forgot-password` y `/reset-password` se abren con o sin sesión (`OPEN_PATHS`); el link sirve aunque haya una sesión abierta en ese navegador. La página de reset saca el token de la barra de direcciones al cargar y se sirve con `Referrer-Policy: no-referrer` desde el proxy: la meta `referrer` llegaba tarde y las fuentes precargadas mandaban el token como Referer. Al guardar vuelve a `/login?reset=1` con un aviso.
**Descartado:**
- El SDK `resend`: una dependencia más para un solo POST.
- Esperar el envío antes de responder: el tiempo de respuesta revelaría si el email existe.
- Distinguir en el error si el link venció o ya se usó: no le sirve a quien lo usa (en los dos casos tiene que pedir otro) y le da información a quien prueba tokens.

### 2026-10-27 · Login con Google (OAuth con PKCE, sin librerías)
**Por qué:**
- **Flujo:** `GET /api/auth/google` genera `state`, `nonce` y un `code_verifier` de PKCE (S256) y los guarda, con el destino (`next`) y el idioma, en una cookie httpOnly firmada con HMAC (`kaname_oauth`, 10 minutos, `Path=/api/auth/google`, `SameSite=Lax`). El callback compara el `state` en tiempo constante, canjea el código con el `code_verifier`, borra la cookie (sirve una vez) y crea la sesión con las mismas cookies que el login normal. Sin tabla nueva: el estado del flujo vive en la cookie.
- **id_token sin verificar la firma:** llega directo del endpoint de tokens de Google, por TLS, en respuesta a nuestro pedido; OpenID Connect (3.1.3.7) permite validar el emisor por el canal en ese caso. Se validan `iss`, `aud`, `exp` y `nonce`. Evita bajar y cachear las claves de Google (JWKS).
- **Vínculo:** primero por `OAuthAccount` (`provider` + `sub` de Google), así un cambio de email en Google no rompe el acceso; si no hay, por email (normalizado) y se crea el vínculo. Solo emails con `email_verified`: si no, cualquiera podría tomar una cuenta registrando ese email en Google. Un usuario nuevo se crea sin contraseña y solo con `REGISTRATION_ENABLED`; si no, `google_registration_closed`.
- **Errores:** el callback siempre redirige; si falla, a `/login?error=<código>` en el idioma del usuario, y la web traduce el código (solo los conocidos, el texto nunca sale de la URL). Cualquier falla del canje o del token da `oauth_failed`, sin detalles.
- **Callback por el proxy de Next** (`WEB_URL/api/auth/google/callback`, o `GOOGLE_REDIRECT_URI`): las cookies quedan en el dominio de la web, igual que con el login normal. Las redirecciones de la API son relativas.
- **Apagado sin credenciales:** sin `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`, `/api/auth/options` informa `googleEnabled: false`, la web no muestra el botón y las rutas dan 404.
- **Tests:** el canje con Google es un servicio aparte (`GoogleOAuthClient`) que los tests reemplazan por un doble que arma el id_token; los tests nunca usan las credenciales reales del `.env`.
- **UI:** `GoogleButton` (link con el estilo del botón secundario y el logo de Google con sus colores oficiales, única excepción a los tokens) y `LabeledSeparator` ("o") en el kit. `safeNextPath` pasó a `@kaname/shared` porque ahora la usa también la API.
**Descartado:**
- Passport (`passport-google-oauth20`) u `openid-client`: dependencias para un flujo de dos pedidos, y Passport no maneja PKCE ni nonce de forma simple.
- Guardar el estado del flujo en la base: una tabla y una limpieza más para algo que dura minutos.
- Vincular por email sin exigir `email_verified`.

### 2026-10-27 · Overrides de pnpm para parches de seguridad
**Por qué:** `pnpm audit` marcaba DoS en `body-parser` <2.4.0 y `multer` <2.5.0, que corren en la API sin sesión. La última versión de Nest que cumple `minimumReleaseAge` (12.2.0) fija multer 2.4.0 y acepta body-parser 2.3, así que se fuerzan con `overrides` en `pnpm-workspace.yaml` (body-parser 2.4.0, multer 2.5.0), junto con fast-uri 3.1.9, que llega vieja por `@prisma/dev`. Prisma pasó a 7.10.1, que ya trae deepmerge-ts 8 y mysql2 3.24. Los overrides se sacan cuando las dependencias traigan esas versiones solas.
**Descartado:** Nest 12.3.x, publicado hoy: no cumple `minimumReleaseAge`.

### 2026-10-27 · Revocar todo solo con el refresh anterior, y rate limit en las rutas de sesión
**Por qué:** reemplaza la regla de reutilización de la entrada de autenticación. Antes, cualquier secreto distinto del vigente revocaba todas las sesiones del usuario, y para eso alcanzaba con conocer el id de la sesión, que viaja en el claim `sid` del access: cualquiera podía desloguear a otro de todos sus dispositivos. Ahora solo revoca el secreto anterior (`previousTokenHash`) pasado el margen de 30 s, que prueba que alguien tuvo un refresh real de esa sesión. Un secreto que no coincide con nada da 401 sin tocar nada. Además, `POST /auth/refresh`, `POST /auth/logout` y el callback de Google tienen rate limit por IP (`SessionRateLimit`, 30 por minuto): más holgado que el del login porque la web los usa sola.
**Descartado:** guardar el historial completo de hashes rotados para detectar también refresh de dos o más rotaciones atrás: una tabla más para un caso que el anterior ya cubre (quien roba un refresh lo usa enseguida).

### 2026-10-27 · IP del cliente con un secreto compartido entre Next y la API
**Por qué:** reemplaza `TRUST_PROXY`. Con un número fijo de proxies de confianza, `req.ip` dependía de cuántos saltos hubiera delante (Vercel → Render agrega uno): con pocos, todos compartían la IP de Vercel y cualquiera bloqueaba el login de todos; con más, quien llamara a Render directo elegía su IP con `X-Forwarded-For`. Ahora Express no confía en `X-Forwarded-For` y `req.ip` es la IP de la conexión. El proxy de Next manda la IP del cliente en `x-kaname-client-ip` junto con `x-kaname-proxy-secret` (`PROXY_SHARED_SECRET`, el mismo en la web y en la API), y borra esos dos headers si los manda el cliente. La API usa esa IP solo si el secreto coincide (comparación en tiempo constante) y es una IP válida. En producción el secreto es obligatorio: sin él la API no arranca.
**Descartado:** fijar la cantidad exacta de saltos de Render: depende de una infraestructura que no controlamos y no frena a quien llama a la API directo.

### 2026-10-27 · NODE_ENV obligatorio y links de recuperación fuera del log
**Por qué:** las cookies Secure, Resend obligatorio y el secreto del proxy dependen de `NODE_ENV=production`, y antes `NODE_ENV` valía `development` por defecto: un servidor sin la variable arrancaba con cookies sin Secure y escribía en el log los emails de recuperación, con el link y el token. Ahora `NODE_ENV` no tiene valor por defecto y sin él la API no arranca. Sin Resend, el log muestra solo destinatario y asunto; el email entero solo con `DEV_LOG_RESET_LINKS=true`, que en producción hace fallar el arranque.
**Descartado:** derivar Secure de que `WEB_URL` sea https: deja Resend y el log atados a otra variable, y separa en dos lo que es una sola decisión (si el entorno es producción).

### 2026-10-27 · forgot-password: 3 links por hora por email
**Por qué:** con el límite por email del login (10 cada 15 minutos), cualquiera podía mandarle a una casilla cerca de mil emails por día y gastar la cuota gratis de Resend (100 por día). `POST /auth/forgot-password` mantiene el límite por IP y por email pasa a 3 por hora. Además, borrar los links pendientes y crear el nuevo van en una transacción, así dos pedidos simultáneos no dejan dos links válidos.
**Descartado:** un límite diario aparte: con 3 por hora alcanza para no gastar la cuota.

### 2026-10-27 · CSRF: Origin permitido y body JSON en los métodos que cambian estado
**Por qué:** SameSite=Lax no frena a otros subdominios del mismo sitio (por ejemplo, si la web termina en un dominio con otras páginas). En POST, PUT, PATCH y DELETE, la API rechaza con 403 un `Origin` que no esté en `WEB_ORIGIN` (también `null`) y con 415 (`unsupported_media_type`) un body que no sea `application/json`, que un `<form>` de otro sitio no puede mandar. Sin `Origin` pasa: los navegadores siempre lo mandan entre sitios y el servidor de Next no lo manda. Un POST sin body (refresh, logout) no necesita Content-Type.
**Descartado:** un token CSRF (double submit): agrega estado en la web y en la API para lo que ya cubren Origin y el tipo de contenido.

### 2026-10-27 · Vida máxima de la sesión: 90 días
**Por qué:** cada rotación corría el vencimiento 30 días, así que un refresh robado y usado seguido no vencía nunca. Ahora una sesión dura como mucho 90 días desde el login (`Session.createdAt`), rote o no: el vencimiento de cada rotación no pasa ese tope y un refresh de una sesión más vieja da 401 y la borra. Como `expiresAt` queda topeado, el access también deja de valer. Sin cambios de schema.
**Descartado:** acortar el refresh a menos de 30 días: obliga a iniciar sesión más seguido a quien usa la app todos los días, sin frenar más al que roba el refresh.

### 2026-10-27 · Headers de seguridad: helmet en la API y CSP en Next
**Por qué:** sin `frame-ancestors` ni `X-Frame-Options`, las pantallas de login y de reset se podían meter en un iframe ajeno (clickjacking), y faltaban HSTS y `nosniff`. La API usa `helmet` con una CSP mínima (`default-src 'none'; frame-ancestors 'none'`), porque solo devuelve JSON y redirecciones. Next manda en las páginas (no en `/api/*`, que trae los de la API) CSP, `X-Frame-Options: DENY`, `nosniff`, HSTS de dos años, `Referrer-Policy` y `Permissions-Policy`. La CSP permite scripts y estilos en línea, que usan Next y next-themes, e imágenes de `*.googleusercontent.com` (fotos de perfil de Google). En desarrollo agrega `unsafe-eval` y `ws:` para la recarga.
**Descartado:** CSP con nonces: cada página pasaría a renderizarse en cada pedido y se perdería el prerender parcial. HSTS con `includeSubDomains` y `preload`: compromete a todo el dominio antes de saber cuál va a ser.
