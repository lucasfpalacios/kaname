---
name: Executive Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#003e61'
  on-tertiary: '#ffffff'
  tertiary-container: '#005684'
  on-tertiary-container: '#8fcbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  kpi-metric:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system establishes an executive-grade operational environment tailored for complex multi-business orchestration. The platform delivers uncompromising clarity, high data density, and absolute situational control for founders, C-suite executives, and regional operations directors managing multi-entity enterprises in Argentina and Latin America.

### Aesthetic Paradigm
The visual philosophy balances modern minimalism with high-density data utility. It avoids ornamental noise, relying on razor-sharp contrast ratios, strict geometric discipline, and deliberate typographic rhythm. The interface creates an atmosphere of institutional calm—reducing cognitive fatigue during intensive multi-hour sessions across ERP modules, multi-currency price books, and financial ledgers.

### Tone and Regional Identity
The UI copy, numerical formats, and system messaging are strictly localized in Argentine Spanish (`es-AR`). Tone is direct, precise, executive, and frictionless (`Vos/Usted` colloquialisms are avoided in navigation and data labels; neutral operational clarity dominates, e.g., *"Guardar cambios"*, *"Descargar balance"*, *"Vincular empresa"*). Currency and numerical formats observe Argentine standards: period as thousands separator and comma as decimal separator (`$ 1.250.450,00 ARS`).

## Colors

The palette is engineered around high functional differentiation, pairing deep indigo with a neutral slate architecture. Both Light and Dark modes maintain absolute parity in semantic hierarchy while calibrating contrast to prevent visual vibration.

### Light Mode Foundations
- **Background App / Canvas**: `#F8FAFC` (Slate 50)
- **Surface Layer 1 (Cards, Tables, Panels)**: `#FFFFFF`
- **Surface Layer 2 (Sub-panels, Nested Tables, Hover)**: `#F1F5F9` (Slate 100)
- **Border Default**: `#E2E8F0` (Slate 200)
- **Border Strong**: `#CBD5E1` (Slate 300)
- **Text Primary**: `#0F172A` (Slate 900)
- **Text Secondary**: `#475569` (Slate 600)
- **Text Muted**: `#94A3B8` (Slate 400)

### Dark Mode Foundations
- **Background App / Canvas**: `#0B0F19` (Custom Obsidian Slate)
- **Surface Layer 1 (Cards, Tables, Panels)**: `#111827` (Slate 900 / Gray 900)
- **Surface Layer 2 (Sub-panels, Nested Rows, Hover)**: `#1F2937` (Slate 800)
- **Border Default**: `#1E293B` (Slate 800)
- **Border Strong**: `#334155` (Slate 700)
- **Text Primary**: `#F8FAFC` (Slate 50)
- **Text Secondary**: `#94A3B8` (Slate 400)
- **Text Muted**: `#64748B` (Slate 500)

### Brand & Interactive Accents
- **Primary Indigo (Interactive / Focus / Action)**:
  - Base: `#4338CA` (Indigo 700)
  - Hover: `#3730A3` (Indigo 800)
  - Light Accent Surface: `#EEF2FF` (Indigo 50)
  - Dark Accent Surface: `#1E1B4B` (Indigo 950)
  - Focus Ring: `rgba(67, 56, 202, 0.35)`

### Semantic Tokens (Functional Status)
- **Éxito (Activo / Liquidado / Confirmado)**:
  - Base: `#059669` (Emerald 600)
  - Surface Light: `#ECFDF5` | Border Light: `#A7F3D0`
  - Surface Dark: `#064E3B` | Border Dark: `#047857`
  - Text: Light `#065F46` | Dark `#6EE7B7`
- **Advertencia (Pendiente / En Revisión)**:
  - Base: `#D97706` (Amber 600)
  - Surface Light: `#FFFBEB` | Border Light: `#FDE68A`
  - Surface Dark: `#451A03` | Border Dark: `#78350F`
  - Text: Light `#92400E` | Dark `#FCD34D`
- **Peligro / Alerta (Inactivo / Rechazado / Vencido)**:
  - Base: `#E11D48` (Rose 600)
  - Surface Light: `#FFF1F2` | Border Light: `#FECDD3`
  - Surface Dark: `#4C0519` | Border Dark: `#881337`
  - Text: Light `#9F1239` | Dark `#FDA4AF`
- **Informativo / Neutro (Borrador / Archivador)**:
  - Base: `#0284C7` (Sky 600)
  - Surface Light: `#F0F9FF` | Border Light: `#BAE6FD`
  - Surface Dark: `#082F49` | Border Dark: `#0369A1`
  - Text: Light `#075985` | Dark `#7DD3FC`

## Typography

The typographic engine uses `Inter` for all structural interfaces, supplemented by `JetBrains Mono` strictly for tabular numeric feeds, financial calculations, CUIT / CUIL numbers, invoice serials, and timestamp metadata.

### Numeric & Tabular Features
- All monetary columns, percentage trends, and fiscal identifiers must activate OpenType tabular numbers (`font-feature-settings: "tnum" 1, "cv05" 1`).
- All negative currency balances must be formatted with an explicit leading minus sign and semantic red tinting (`- $ 14.200,50 ARS`).

### Hierarchy Discipline
- **Display / Headers**: Reserved for high-level business switcher titles, dashboard overviews, and monthly consolidated balance views.
- **KPI Metrics**: 28px bold figures with locked line-height to align beside delta percentage pills without baseline shifts.
- **Data Table Cells**: Standardized at 13px (`body-md`) with 18px line-height, establishing dense vertical packing without compromising cross-row scanability.
- **Micro-labels (`label-sm`)**: Uppercase with 0.03em tracking for table headers, form group dividers, and metadata keys.

## Layout & Spacing

The layout is architected around a fluid, density-optimized SaaS frame composed of an invariant shell (Header + Collapsible Sidebar) and a fluid work canvas.

### Layout Frame Specifications
- **Left Sidebar**:
  - Expanded Width: `260px`
  - Collapsed Width: `68px`
  - Transition: `200ms cubic-bezier(0.2, 0, 0, 1)`
- **Top Navigation Bar**:
  - Height: `56px` fixed
  - Z-Index: `40` (sticky above scrollable canvas)
- **Work Canvas**:
  - Fluid width spanning `calc(100vw - sidebar_width)`
  - Maximum central width on ultrawide monitors (>1800px): `1600px` centered with auto margins.

### Breakpoints & Adaptability
- **Desktop Large (≥ 1440px)**: 12-column grid, 24px gutters, metrics displayed in 4-column rows.
- **Desktop Compact (1024px – 1439px)**: 12-column grid, 16px gutters, metrics displayed in 2 or 4 columns; sidebar default collapsed on 1024px screens.
- **Tablet (768px – 1023px)**: 8-column grid, 16px gutters, sidebar converts into an off-canvas drawer overlay (`z-index: 50`), tables enforce horizontal scroll pinning the first column (e.g., Razon Social or Código de Producto).
- **Mobile (< 768px)**: 4-column layout, bottom action sheet conversions for contextual table menus, metric cards stacked in single column.

## Elevation & Depth

This system avoids heavy drop shadows, instead using crisp 1px borders paired with subtle, low-opacity ambient occlusion. Surfaces communicate hierarchy through light, border contrast, and micro-elevation.

### Elevation Levels
- **Level 0 (App Canvas)**: Flat `#F8FAFC` (Light) / `#0B0F19` (Dark).
- **Level 1 (Default Containers, Metric Cards, Table Containers)**:
  - Light Mode: `background: #FFFFFF; border: 1px solid #E2E8F0; box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);`
  - Dark Mode: `background: #111827; border: 1px solid #1E293B; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.4);`
- **Level 2 (Hover States, Dropdowns, Segment Popovers)**:
  - Light Mode: `background: #FFFFFF; border: 1px solid #CBD5E1; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);`
  - Dark Mode: `background: #1F2937; border: 1px solid #334155; box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.6);`
- **Level 3 (Modals, Overlays, Command Palette `Cmd+K`)**:
  - Light Mode: `background: #FFFFFF; border: 1px solid #CBD5E1; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06);`
  - Dark Mode: `background: #111827; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);`

## Shapes

The interface balances crisp geometric precision with approachable software polish:
- **Base Corner Radius (8px / `0.5rem`)**: Standard across all form controls (inputs, dropdown triggers, search bars), buttons, nested cards, and table container enclosures.
- **Card and Container Outer Radius (12px / `0.75rem`)**: Applied to high-level metric cards, modal shells, and standalone panel enclosures.
- **Pill Radius (`9999px`)**: Reserved exclusively for status indicators, quantitative count pills, and segmented tab toggles.

## Components

### 1. Buttons
- **Primary**: Deep Indigo (`#4338CA`), text `#FFFFFF`, hover `#3730A3`, active `#312E81`. Focus ring `2px` Indigo with `2px` offset.
- **Secondary**: Light background `#FFFFFF` with `#E2E8F0` border, text `#0F172A`. Dark background `#1E293B`, border `#334155`, text `#F8FAFC`.
- **Ghost**: Transparent background, text `#475569`, hover `#F1F5F9` (Light) / hover `#1F2937` (Dark).
- **Danger**: Background `#E11D48`, text `#FFFFFF`, hover `#BE123C`. Used strictly for destructive actions (e.g., *"Eliminar lista"*, *"Desvincular CUIT"*).
- **Icon-Only**: Square ratios: Compact (`32x32px`), Standard (`36x36px`). Always include an explicit `aria-label` in Argentine Spanish (e.g., `"Cerrar panel"`, `"Exportar a Excel"`).

### 2. Form Inputs & Selects
- **Text Inputs**: Height `36px` (compact default) or `40px` (spacious). Border `1px solid #CBD5E1`, border-radius `8px`. Focus state shifts border to `#4338CA` with a 3px ring (`rgba(67, 56, 202, 0.15)`).
- **Leading & Trailing Accessories**: Search inputs embed a 16px search glass icon at left padding `10px`. Trailing accessories display keyboard shortcuts (e.g., `⌘K`).
- **Dropdowns / Selects**: Include current business branch preview, chevron indicator, and type-ahead support for expansive records.

### 3. Status Badges
Pill shapes (`rounded-full`), height `22px`, font size `11px`, font weight `600`, padding `2px 8px`, with a `6px` circular status indicator dot:
- **Activo**: Background `#ECFDF5`, text `#065F46`, dot `#059669`.
- **Pendiente**: Background `#FFFBEB`, text `#92400E`, dot `#D97706`.
- **Inactivo / Alerta**: Background `#FFF1F2`, text `#9F1239`, dot `#E11D48`.
- **Borrador**: Background `#F1F5F9`, text `#475569`, dot `#94A3B8`.

### 4. Metric KPI Cards
- Height: `132px`. Padding: `16px`.
- Layout: Top row hosts the metric label (`label-sm`, Slate 500) and contextual menu or informative tooltip.
- Center hosts the primary value (`kpi-metric`, e.g., `$ 42.850.120,00`).
- Bottom row features the delta trend indicator: pill badge with arrow (e.g., `+14,2% vs. mes anterior` in emerald for positive margin, rose for cost escalations) alongside a subtitle noting the reference window.

### 5. Data Tables
- **Header Row**: Height `36px`, background `#F8FAFC` (Dark: `#0F172A`), uppercase micro-labels (`label-sm`), 1px bottom border `#E2E8F0`. Features column sorting triggers with directional carets.
- **Body Rows**: Height `44px` (dense operational setting). Alternating row highlight on hover (`#F8FAFC` Light / `#1E293B` Dark).
- **Checkboxes**: Custom `16x16px` rounded `4px` with Indigo selection for batch operations (e.g., *"Actualizar precios masivamente"*).
- **Row Actions**: Persistent or hover-revealed ghost button cluster: Editar, Duplicar, Más Opciones (`...`).
- **Pagination Footer**: Row count indicator (`"Mostrando 1-25 de 1.420 resultados"`), page-jump field, and standard previous/next pagination controls.

### 6. Tabs
- **Underline Style**: 2px active indicator in `#4338CA`, positioned flush with the container's bottom border.
- **Pill / Segmented Style**: Contained within an `#F1F5F9` background tray, active pill elevated with white surface and subtle drop shadow.

### 7. Global Shell Navigation Frame
- **Top Bar (56px)**:
  - *Workspace Switcher*: Dropdown displaying company avatar, legal name (e.g., `"Distribuidora Andina S.A."`), and CUIT identifier.
  - *Global Search*: Centered trigger with shortcut key indicator (`"Buscar clientes, facturas, productos... ⌘K"`).
  - *Utility Cluster*: Language toggle (`ES / EN`), light/dark mode switch, notification center with unread badge, and user avatar dropdown menu.
- **Left Collapsible Sidebar (260px / 68px)**:
  - Header: Platform logo mark with product name (`Nexo`) and active environment chip (`"Producción"`).
  - Module Navigation: Direct links paired with 20px icons:
    1. *Productos*
    2. *Clientes*
    3. *Proveedores*
    4. *Listas de Precios*
    5. *Calculadora*
    6. *Precios de Mercado*
    7. *Documentos*
    8. *Métricas Sociales*
    9. *Configuración*
  - Active Item: Indigo tint background (`#EEF2FF` Light / `#1E1B4B` Dark), text `#4338CA`, 3px left vertical indicator bar.
  - Bottom Footer: Collapse trigger button (`"Contraer menú"` / `"Expandir menú"`).