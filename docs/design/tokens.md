# Tokens de diseño

Fuente de verdad para colores. El export de Stitch (`stitch-export.zip`) se usa solo como referencia de estructura y layout: sus colores generados no coinciden exactamente con esta paleta.

Paleta inspirada en colores tradicionales japoneses. Radios: 8–12px. Bordes sutiles, sombras mínimas.

| Token | Claro | Oscuro |
|---|---|---|
| background | `#FFFFFC` Gofun-iro | `#0F1A33` Kon-iro |
| card / surface | `#FFFFFF` | `#1A2747` |
| border | `#E5E7EB` | `#293B63` |
| foreground (texto) | `#1F2033` Sumi | `#F3F1F6` |
| primary | `#1E50A2` Ruri-iro | `#89C3EB` Wasurenagusa-iro |
| primary-foreground | `#FFFFFF` | `#0F1A33` |
| accent | `#F09199` Momo-iro | `#F4B3C2` Toki-iro |
| accent-soft | `#FEF4F4` Sakura-iro | `#3A2A3F` |
| success | `#2E7D5B` | `#56C288` (fondo `#123326`) |
| warning | `#C88A35` | `#F6C163` (fondo `#382B12`) |
| error / destructive | `#C93A40` | `#FF7B82` (fondo `#3E1B20`) |
| chart-1 (serie 1) | `#1E50A2` Ruri-iro | `#89C3EB` Wasurenagusa-iro |
| chart-2 (serie 2) | `#F09199` Momo-iro | `#F4B3C2` Toki-iro |

## Tipografía (estilo "Mincho clásico")

Las dos son fuentes japonesas de Google Fonts, gratis y con alfabeto latino. Cargar con `next/font/google`; Google sirve los glifos japoneses por bloques, así que solo se descargan los kanji que se usan.

| Rol | Fuente | Pesos | Dónde |
|---|---|---|---|
| `--font-display` | **Shippori Mincho B1** | 600, 800 | Logo, títulos de página (h1–h3), nombres de espacio, acentos kanji |
| `--font-sans` | **Zen Kaku Gothic New** | 400, 500, 700 | Todo lo demás: interfaz, tablas, formularios, botones, KPIs |

- Display con dos pesos: 800 para h1; 600 para h2, h3, nombres de espacio y acentos kanji.
- La Mincho nunca va en textos chicos (menos de 18px), tablas ni botones: es de títulos.
- Números: `tabular-nums`. Si Zen Kaku Gothic New no alinea bien los dígitos en columnas, usar una fuente de respaldo solo para celdas numéricas y avisar.
- Fallbacks: `"Hiragino Mincho ProN", serif` para display y `"Hiragino Sans", "Noto Sans JP", system-ui, sans-serif` para interfaz.
- Escala: 12 / 14 / 16 / 18 / 22 / 28 / 36. Etiquetas en mayúscula con `letter-spacing: .08em`.

## Acentos kanji

El 要 es el logo. Cada módulo tiene un kanji que aparece chico, en color `accent` y fuente display, junto al título de la página o en el sidebar colapsado. Es decorativo: siempre acompaña al texto en español, nunca lo reemplaza, y lleva `aria-hidden="true"`.

| Módulo | Kanji | | Módulo | Kanji |
|---|---|---|---|---|
| General | 総合 | | Pedidos / ventas | 注文 |
| Resumen | 概要 | | Compras | 仕入 |
| Productos | 商品 | | Documentos | 書類 |
| Stock | 在庫 | | Presupuestos | 見積 |
| Clientes | 顧客 | | Calendario | 予定 |
| Proveedores | 仕入先 | | Métricas de redes | 指標 |
| Listas de precios | 価格表 | | Proyectos | 案件 |
| Calculadora | 計算 | | Administración | 管理 |
| Precios de mercado | 相場 | | | |

Referencia visual de la combinación: https://claude.ai/artifact/4Bh5Zg5YirdD45rNQpMbf6 (opción A).

Reglas:
- Nunca texto rosa sobre fondo claro (contraste insuficiente). El rosa es acento: badges, gráficos, estados.
- Gráficos: serie 1 = `chart-1`, serie 2 = `chart-2`. Sin violeta. Son fijos: no cambian con el acento del espacio, así el mismo gráfico se lee igual en todos los espacios.

## Acento por espacio

`Workspace.color` (solo `#rrggbb`) reemplaza `accent` y `accent-soft` dentro del contenedor del espacio. En oscuro se aclara un 35% hacia blanco para que se vea sobre Kon-iro. Sin color queda Momo-iro / Toki-iro.

Es solo identidad: insignia del espacio (WorkspaceAvatar), kanji de los módulos, ítem activo del sidebar, badges `accent`. Nunca va en los gráficos ni como color de texto (el color lo elige el usuario y puede no tener contraste).
- Montos nunca cortan en dos líneas (`whitespace-nowrap`, `tabular-nums`).

## Pantallas de referencia (en el zip)
login_light/dark · home_light/dark (launcher) · general_light/dark · tank_vault_light/dark · productos_light/dark · calculadora_light/dark · dashboard_edit_light/dark · calendario_light/dark + calendario_modal_light · admin_light/dark · admin_roles_light/dark.
Ignorar: `nexo_pantalla_1_*`, `nexo_pantalla_2_*` y `nexo_enterprise_precision` (versiones descartadas).
