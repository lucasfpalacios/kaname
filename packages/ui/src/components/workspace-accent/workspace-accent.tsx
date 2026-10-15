import { Slot } from "radix-ui";
import type { ComponentProps, CSSProperties } from "react";

// Acento dinámico por espacio: Workspace.color sobreescribe --accent (y --accent-soft) en el
// contenedor. Todo lo de adentro que use el acento (badges, kanji, serie 2 de los gráficos,
// WorkspaceAvatar) toma el color del espacio. Solo acepta #rrggbb: el color lo carga el usuario y
// va a un style inline. Sin color válido queda el acento por defecto del tema.

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function isWorkspaceColor(color: unknown): color is string {
  return typeof color === "string" && HEX_COLOR.test(color);
}

/** Props para poner el acento de un espacio en cualquier contenedor. */
export function workspaceAccentProps(color: string | null | undefined): {
  "data-workspace-accent"?: "";
  style?: CSSProperties;
} {
  if (!isWorkspaceColor(color)) return {};
  return {
    "data-workspace-accent": "",
    style: { "--workspace-color": color } as CSSProperties,
  };
}

export type WorkspaceAccentProps = Omit<ComponentProps<"div">, "color"> & {
  /** Workspace.color (#rrggbb). null usa el acento por defecto. */
  color: string | null | undefined;
  asChild?: boolean;
};

export function WorkspaceAccent({
  color,
  asChild = false,
  style,
  ...props
}: WorkspaceAccentProps) {
  const Comp = asChild ? Slot.Root : "div";
  const accent = workspaceAccentProps(color);
  return (
    <Comp
      {...props}
      data-workspace-accent={accent["data-workspace-accent"]}
      style={{ ...accent.style, ...style }}
    />
  );
}
