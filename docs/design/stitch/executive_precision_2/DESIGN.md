---
name: Executive Precision
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d8f2'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#eeecff'
  surface-container-high: '#e7e6ff'
  surface-container-highest: '#e1e0fa'
  on-surface: '#191a2d'
  on-surface-variant: '#434751'
  inverse-surface: '#2e2f43'
  inverse-on-surface: '#f1efff'
  outline: '#737783'
  outline-variant: '#c3c6d3'
  surface-tint: '#2d5cae'
  primary: '#003982'
  on-primary: '#ffffff'
  primary-container: '#1e50a2'
  on-primary-container: '#afc7ff'
  inverse-primary: '#aec6ff'
  secondary: '#236488'
  on-secondary: '#ffffff'
  secondary-container: '#9cd6fe'
  on-secondary-container: '#1a5d81'
  tertiary: '#69252e'
  on-tertiary: '#ffffff'
  tertiary-container: '#863b44'
  on-tertiary-container: '#ffb3b8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#064395'
  secondary-fixed: '#c7e7ff'
  secondary-fixed-dim: '#93cdf6'
  on-secondary-fixed: '#001e2e'
  on-secondary-fixed-variant: '#004c6d'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b8'
  on-tertiary-fixed: '#3e0410'
  on-tertiary-fixed-variant: '#772f38'
  background: '#fbf8ff'
  on-background: '#191a2d'
  surface-variant: '#e1e0fa'
  bg-canvas-light: '#FFFFFC'
  surface-card-light: '#FFFFFF'
  border-subtle-light: '#EAEAEA'
  accent-momo: '#F09199'
  accent-soft-sakura: '#FEF4F4'
  text-sumi-light: '#1F2033'
  text-secondary-light: '#5E6478'
  bg-canvas-dark: '#0F1A33'
  surface-card-dark: '#1A2747'
  primary-wasurenagusa-dark: '#89C3EB'
  accent-toki-dark: '#F4B3C2'
  text-sumi-dark: '#F3F1F6'
  text-secondary-dark: '#9AA5BE'
  border-subtle-dark: '#23335A'
  semantic-success: '#2E7D5B'
  semantic-success-soft: '#EDF6F1'
  semantic-warning: '#C88A35'
  semantic-warning-soft: '#FBF5EB'
  semantic-error: '#C93A40'
  semantic-error-soft: '#FDF2F2'
  semantic-info: '#3B72AF'
  semantic-info-soft: '#EFF5FC'
  success-dark: '#56C288'
  success-dark-soft: '#123326'
  warning-dark: '#F6C163'
  warning-dark-soft: '#382B12'
  error-dark: '#F87171'
  error-dark-alt: '#FF7B82'
  error-dark-soft: '#3E1B20'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  kpi-metric:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  kpi-metric-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
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
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system establishes a high-density, executive-grade workspace engineered for multi-tenant enterprise software, financial control panels, and supply-chain logistics. It merges contemporary digital ergonomics with the calibrated restraint of traditional Japanese color discipline (*dentō-shoku*). Rather than adopting pastiche or decorative themes, the system applies traditional pigments strictly for functional clarity, visual composure, and chromatic balance.

The visual style blends disciplined minimalism with subtle tonal layering:
- **Atmosphere**: Composed, rational, institutional, and resilient under sustained cognitive load.
- **Visual Weight**: Crisp 1px geometric borders, matte surfaces, and restrained ambient depth rather than loud structural effects.
- **Information Density**: Compact line heights and baseline alignments optimized for high-throughput operational review, data grids, and analytical reporting.

## Colors

The system uses dedicated chromatic palettes across light and dark modes to balance legibility and WCAG AA contrast standards.

### Core Palettes

#### Light Mode Foundation
- **Canvas (`bg-canvas-light`)**: `#FFFFFC` (Gofun-iro warm mineral base preventing glare during extended sessions).
- **Surface (`surface-card-light`)**: `#FFFFFF` bounded by `#EAEAEA`.
- **Primary (`primary`)**: `#1E50A2` (Ruri-iro lapis lazuli) for high-emphasis CTAs, active segmented states, and interactive landmarks.
- **Accent (`accent-momo`)**: `#F09199` (Momo-iro peach blossom) for highlights and analytical markers.
- **Accent Soft (`accent-soft-sakura`)**: `#FEF4F4` (Sakura tint) for active chip containers, subtle selections, and badge fills.
- **Text Primary (`text-sumi-light`)**: `#1F2033` (Sumi deep indigo-black).
- **Text Secondary (`text-secondary-light`)**: `#5E6478` (Neutral slate).

#### Dark Mode Foundation
- **Canvas (`bg-canvas-dark`)**: `#0F1A33` (Kon-iro deep navy).
- **Surface (`surface-card-dark`)**: `#1A2747` (Elevated oceanic blue slate).
- **Primary (`primary-wasurenagusa-dark`)**: `#89C3EB` (Wasurenagusa sky-blue for high contrast over dark navy).
- **Accent (`accent-toki-dark`)**: `#F4B3C2` (Toki-iro soft crested ibis pink).
- **Text Primary (`text-sumi-dark`)**: `#F3F1F6` (Anti-halation off-white).
- **Text Secondary (`text-secondary-dark`)**: `#9AA5BE` (Periwinkle slate).
- **Border Subtle (`border-subtle-dark`)**: `#23335A` (Precise surface seam).

### Semantic Variants

#### Light Mode Status Tokens
- **Success**: Text/Icon `#2E7D5B` (Tokiwa-iro evergreen) on `#EDF6F1`.
- **Warning**: Text/Icon `#C88A35` (Yamabuki amber-gold) on `#FBF5EB`.
- **Error**: Text/Icon `#C93A40` (Beni-hi crimson) on `#FDF2F2`.
- **Info**: Text/Icon `#3B72AF` on `#EFF5FC`.

#### Dark Mode Calibrated Status Tokens
Specifically tuned for dark navy backgrounds (`#0F1A33` and `#1A2747`):
- **Success Dark**: `#56C288` (Byakuroku jade variant) text and icon on `#123326` soft container.
- **Warning Dark**: `#F6C163` (Yamabuki bright gold variant) text and icon on `#382B12` soft container.
- **Error Dark**: `#F87171` (with `#FF7B82` as light carmine alternative) text and icon on `#3E1B20` soft container.
- **Info Dark**: `#89C3EB` text and icon on `#152B47` soft container.

Raw accent pinks (`#F09199`, `#F4B3C2`) must never be used for continuous body copy or small data labels; restrict them to container indicators, data visualizations, and contextual tag glyphs.

## Typography

The typography scale utilizes `Inter` across all structural layers to maximize legibility and alignment clarity within dense enterprise tables and dashboards.

### Functional Rules
- **Tabular Numerals**: Apply `font-feature-settings: "tnum" 1, "cv05" 1` to financial ledgers, fiscal identifiers (CUIT/CUIL), inventory codes, and timestamp columns to keep baselines uniform.
- **Hierarchy Mapping**:
  - `kpi-metric` / `kpi-metric-mobile`: Primary analytical indicators, currency balances, and operational aggregates.
  - `headline-lg` through `headline-sm`: Page headers, modal titles, and section dividers.
  - `body-md`: Standard data grid content and form fields.
  - `label-sm`: Microcopy, data column headers, badge chips, and metadata hints.

## Layout & Spacing

The operational workspace uses an adaptive multi-column grid within a fixed application shell:

### Application Shell
- **Primary Navigation Rail / Sidebar**: 260px expanded, collapsing down to 68px. Transitions take 200ms with linear deceleration.
- **Header Bar**: 56px fixed height, pinned at the top viewport boundary.
- **Operational Canvas**: Fluid container spanning `calc(100vw - sidebar_width)` with a maximum content ceiling of 1600px.

### Responsive Breakpoints
- **Desktop (≥ 1280px)**: 12-column layout, 24px margins, 16px or 24px gutters. KPI metric decks display 4 columns.
- **Compact Desktop (1024px – 1279px)**: 12-column layout, 16px gutters, 24px margins. Sidebar collapses to 68px icon rail. KPI metric decks render 2 or 4 columns.
- **Tablet (768px – 1023px)**: 8-column layout, 16px margins. Sidebar transforms into an off-canvas drawer overlay (`z-index: 50`). Data tables enforce horizontal scrolling with pinned left columns.
- **Mobile (< 768px)**: 4-column layout, 16px canvas margins. Metric decks collapse into single-column stacks. Complex action rows move into bottom drawer sheets.

## Elevation & Depth

Visual hierarchy uses tonal surface separation and subtle outlines instead of high-contrast drop shadows.

- **Level 0 (Canvas Base)**: `#FFFFFC` (Light) or `#0F1A33` (Dark). Completely flat.
- **Level 1 (Cards, Data Tables, Analytical Panels)**:
  - *Light*: Surface `#FFFFFF`, border 1px solid `#EAEAEA`, shadow `0 1px 3px rgba(31, 32, 51, 0.04)`.
  - *Dark*: Surface `#1A2747`, border 1px solid `#23335A`, shadow `0 1px 3px rgba(0, 0, 0, 0.30)`.
- **Level 2 (Popovers, Select Menus, Inset Dropdowns)**:
  - *Light*: Surface `#FFFFFF`, border 1px solid `#DFDFDF`, shadow `0 4px 12px -2px rgba(31, 32, 51, 0.08)`.
  - *Dark*: Surface `#1A2747`, border 1px solid `#2E416E`, shadow `0 6px 16px -2px rgba(0, 0, 0, 0.50)`.
- **Level 3 (Modals, Overlays, Command Center `⌘K`)**:
  - *Light*: Surface `#FFFFFF`, border 1px solid `#D0D0D0`, shadow `0 16px 32px -4px rgba(31, 32, 51, 0.12)`.
  - *Dark*: Surface `#1A2747`, border 1px solid `#374E85`, shadow `0 20px 40px -4px rgba(0, 0, 0, 0.70)`.

## Shapes

The interface balances compact structural geometry with modern edge curvature:
- **Form Elements & Controls (8px / `0.5rem`)**: Standard for action buttons, inputs, segmented trays, select menus, and nested table controls.
- **Structural Surfaces & Enclosures (12px / `0.75rem`)**: Used for metric cards, table shells, dashboard containers, flyout drawers, and modal dialogs.
- **Pill Badges (`9999px`)**: Reserved for status indicators, counter badges, and pill tabs.

## Components

### Buttons
- **Primary**:
  - *Light*: `#1E50A2` fill, text `#FFFFFF`. Hover: 8% darker.
  - *Dark*: `#89C3EB` fill, text `#0F1A33`. Hover: 8% lighter.
  - Height: 36px (compact) or 40px (default). Radius: 8px. Focus ring: 2px offset.
- **Secondary**:
  - *Light*: `#FFFFFF` fill, 1px border `#EAEAEA`, text `#1F2033`.
  - *Dark*: `#1A2747` fill, 1px border `#23335A`, text `#F3F1F6`.
- **Ghost**:
  - Transparent fill. Text `#5E6478` (light) or `#9AA5BE` (dark).
  - Hover background: `#FEF4F4` (light) or `#23335A` (dark).
- **Destructive**:
  - *Light*: `#C93A40` fill, text `#FFFFFF`.
  - *Dark*: `#F87171` fill, text `#0F1A33`.

### Status Badges & Indicators
Height: 22px, padding: 2px 8px, shape: full pill (`9999px`). Features a 6px status dot alongside `label-sm` text:
- **Success / Liquidado / Activo**:
  - *Light*: Fill `#EDF6F1`, text & dot `#2E7D5B`.
  - *Dark*: Fill `#123326`, text & dot `#56C288`.
- **Warning / En Revisión / Pendiente**:
  - *Light*: Fill `#FBF5EB`, text & dot `#C88A35`.
  - *Dark*: Fill `#382B12`, text & dot `#F6C163`.
- **Error / Anulado / Rechazado**:
  - *Light*: Fill `#FDF2F2`, text & dot `#C93A40`.
  - *Dark*: Fill `#3E1B20`, text & dot `#F87171` (or `#FF7B82`).
- **Info / En Proceso**:
  - *Light*: Fill `#EFF5FC`, text & dot `#3B72AF`.
  - *Dark*: Fill `#152B47`, text & dot `#89C3EB`.

### Form Fields & Inputs
- Height: 36px (dense) or 40px (standard). Border radius: 8px.
- *Light*: Background `#FFFFFF`, 1px border `#EAEAEA`, text `#1F2033`, placeholder `#5E6478`.
- *Dark*: Background `#141F3B`, 1px border `#23335A`, text `#F3F1F6`, placeholder `#9AA5BE`.
- Active focus state: 1px border `#1E50A2` (light) or `#89C3EB` (dark) with a 3px soft aura ring.

### Metric Cards
- Minimum height: 120px. Padding: 16px. Border radius: 12px.
- Top: Label in `label-sm` (`text-secondary`) and action icon.
- Center: `kpi-metric` numerical display with tabular numerals.
- Bottom: Semantic badge showing the delta trend alongside comparison subtext.

### Data Tables
- **Header**: Height 36px. Light background `#F7F7F4` with 1px border `#EAEAEA`; dark background `#141F3B` with 1px border `#23335A`. Label in `label-sm` uppercase.
- **Rows**: Dense height of 44px. Hover highlight: `#FEF4F4` at 40% opacity in light mode; `#1E2D52` in dark mode.
- **Row Selection**: Checkbox with 8px radius (`rounded-sm`), filled with `#1E50A2` (light) or `#89C3EB` (dark) when checked.