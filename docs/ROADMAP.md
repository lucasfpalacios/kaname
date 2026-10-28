# Roadmap

Piloto: **Tank Vault TCG**. Cada fase termina con algo que se puede usar y con lint/typecheck/build en verde.

## Fase 0 — Base del proyecto ✅
- [x] Monorepo pnpm + Turborepo con `apps/web` (Next.js) y `apps/api` (NestJS)
- [x] Paquete compartido `packages/shared` (tipos, enums, validaciones zod)
- [x] Postgres local con Docker Compose
- [x] Prisma en `apps/api` (`apps/api/prisma/schema.prisma`) + primera migración + seed (cuenta de Lucas, 4 espacios, roles del sistema)
- [x] Tailwind configurado para consumir los tokens de `@kaname/ui`, tema claro/oscuro
- [x] next-intl (es/en)
- [x] ESLint + Prettier + scripts `lint`, `typecheck`, `build`, `dev`
- [x] Repo en GitHub

## Fase 0.5 — UI Kit (`packages/ui`) ✅
Cada componente: variantes con `cva`, tipado, accesible, probado en claro/oscuro y con su story.
- [x] Storybook con selector de tema (claro/oscuro) y de idioma (es/en)
- [x] Fundamentos: acentos kanji por módulo, espaciados, íconos (lucide) y stories de los fundamentos. Ya hechos en la Fase 0: tokens como variables CSS, tipografía (Shippori Mincho B1 + Zen Kaku Gothic New), radios y `ThemeProvider`
- [x] Acento dinámico por espacio: `Workspace.color` sobreescribe `--accent` en su contenedor
- [x] Base (shadcn/ui adaptado): Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Switch, RadioGroup, DatePicker, Badge, Card, Tabs, Dialog, Sheet/Drawer, DropdownMenu, Tooltip, Popover, Toast, Avatar, Skeleton, Separator
- [x] Formularios: FormField (label, ayuda, error), MoneyInput (ARS/USD), PercentInput
- [x] Datos: DataTable (TanStack Table: orden, filtros, búsqueda, paginación, selección y acciones masivas), MoneyText, DateText, StatusBadge, EmptyState, KpiCard, ChartCard (Recharts con la paleta)
- [x] Layout: AppShell, TopBar, Sidebar (colapsable), WorkspaceSwitcher, PageHeader, WorkspaceTile (launcher), Breadcrumbs
- [x] Página `/ui-kit` en `apps/web` (solo en desarrollo) para ver los componentes dentro de la app real

## Fase 1 — Auth y permisos ✅
- [x] Registro / login email+contraseña, refresh tokens
- [x] Recuperación de contraseña (link por email con Resend)
- [x] Login con Google
- [x] Guard de Nest: usuario + workspace + permiso de módulo
- [x] Pantalla Login (claro/oscuro, es/en)
- [x] Revisión de seguridad de la fase y correcciones (sesiones, aislamiento, rate limits, CSRF, headers, dependencias)

## Fase 2 — Esqueleto de la app
- [x] Layout: top bar + sidebar + selector de espacio (shell con datos reales, URLs con slug, preferencias de tema e idioma en el usuario)
- [x] Inicio (launcher con botones de espacios + "General") y vista General con las tarjetas de cada espacio (métricas y eventos vacíos hasta que existan sus módulos)
- [x] Crear / editar espacio y activar módulos (solo el Dueño de la cuenta; archivar con confirmación)

## Fase 3 — Catálogo
- [ ] Categorías, productos y variantes (CRUD, tabla, drawer de detalle)
- [ ] Proveedores
- [ ] Recetas / insumos (para Disanza)

## Fase 4 — Comercial
- [ ] Clientes
- [ ] Listas de precios
- [ ] Pedidos / ventas + pagos + descuento de stock
- [ ] Compras / importaciones + ingreso de stock y costo

## Fase 5 — Herramientas
- [ ] Calculadora (motor de fórmulas + plantillas). Antes, FormulaEditor en el UI Kit con su story
- [ ] Calendario (mes/semana/día/agenda + eventos vinculados). Antes, CalendarEventChip en el UI Kit con su story
- [ ] Documentos (subida a R2) y presupuestos (PDF desde plantilla)
- [ ] Proyectos (para Shinka)

## Fase 6 — Datos externos
- [ ] Cotización del dólar (oficial, MEP, tarjeta)
- [ ] Precios de mercado: fuentes, seguimiento, scraping programado, historial
- [ ] Métricas de Instagram / TikTok / YouTube

## Fase 7 — Dashboards y admin
- [ ] Dashboard por espacio con widgets editables. Antes, WidgetFrame en el UI Kit con su story
- [ ] Vista General (comparativo entre espacios)
- [ ] Panel Admin: usuarios, invitaciones, roles y matriz de permisos. Antes, PermissionsMatrix en el UI Kit con su story
  - [ ] Invitaciones: validar que el rol de la membresía sea de la misma cuenta que el espacio
- [ ] Registro de actividad

## Antes de abrir el registro
- [ ] Verificar el email al registrarse
- [ ] Vincular Google a una cuenta existente solo si el email ya está verificado o desde una sesión iniciada (si no, se puede tomar una cuenta registrada con un email ajeno)
- [ ] Rechazar contraseñas filtradas (listas de contraseñas expuestas)

## Fase 8 — Deploy (gratis)
- [ ] Web en Vercel, API en Render, DB en Neon, Redis en Upstash, archivos en R2
- [ ] Rate limit con Upstash Redis: hoy vive en memoria, se pierde en cada reinicio y no se comparte entre instancias
- [ ] `PROXY_SHARED_SECRET` configurado en Vercel y en Render (el mismo en los dos; sin él la API no arranca en producción)
- [ ] `NEST_URL` definida en Vercel al momento del build: el destino del reenvío de `/api/*` se fija al compilar la web
- [ ] Sacar los overrides de body-parser, multer y fast-uri cuando Nest y Prisma traigan las versiones corregidas
