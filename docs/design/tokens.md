# Tokens de diseño

Fuente de verdad para colores. El export de Stitch (`stitch-export.zip`) se usa solo como referencia de estructura y layout: sus colores generados no coinciden exactamente con esta paleta.

Paleta inspirada en colores tradicionales japoneses. Tipografía: Inter. Radios: 8–12px. Bordes sutiles, sombras mínimas.

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

Reglas:
- Nunca texto rosa sobre fondo claro (contraste insuficiente). El rosa es acento: badges, gráficos, estados.
- Gráficos: serie 1 = primary, serie 2 = accent. Sin violeta.
- Montos nunca cortan en dos líneas (`whitespace-nowrap`, `tabular-nums`).

## Pantallas de referencia (en el zip)
login_light/dark · home_light/dark (launcher) · general_light/dark · tank_vault_light/dark · productos_light/dark · calculadora_light/dark · dashboard_edit_light/dark · calendario_light/dark + calendario_modal_light · admin_light/dark · admin_roles_light/dark.
Ignorar: `nexo_pantalla_1_*`, `nexo_pantalla_2_*` y `nexo_enterprise_precision` (versiones descartadas).
