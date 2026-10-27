// Estructura común de los emails: tabla centrada con estilos en línea (los clientes de correo
// ignoran casi todo el CSS externo), el logo 要 Kaname como texto y los colores de tokens.md en
// claro. El texto se escapa: lo que entra por parámetro nunca se interpreta como HTML.

const COLORS = {
  background: "#fffffc",
  card: "#ffffff",
  border: "#e5e7eb",
  foreground: "#1f2033",
  muted: "#676774",
  primary: "#1e50a2",
  primaryForeground: "#ffffff",
};

const FONT =
  "'Zen Kaku Gothic New', 'Hiragino Sans', 'Noto Sans JP', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
const DISPLAY = "'Shippori Mincho B1', 'Hiragino Mincho ProN', Georgia, serif";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type EmailContent = {
  lang: string;
  title: string;
  /** Párrafos antes del botón. */
  intro: string[];
  button: { label: string; url: string };
  /** Párrafos después del botón (vencimiento, "si no fuiste vos"...). */
  outro: string[];
  /** Texto para copiar el link si el botón no anda. */
  fallback: string;
  footer: string;
};

const paragraph = (text: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.foreground};">${escapeHtml(text)}</p>`;

export function renderEmail(content: EmailContent): string {
  const url = escapeHtml(content.button.url);
  return `<!doctype html>
<html lang="${escapeHtml(content.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(content.title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.background};font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:0 0 24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;height:40px;background:${COLORS.primary};border-radius:8px;text-align:center;vertical-align:middle;font-family:${DISPLAY};font-size:24px;line-height:40px;color:${COLORS.primaryForeground};" lang="ja">要</td>
<td style="padding-left:10px;font-family:${DISPLAY};font-size:22px;font-weight:800;color:${COLORS.foreground};">Kaname</td>
</tr></table>
</td></tr>
<tr><td style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;padding:32px;">
<h1 style="margin:0 0 16px;font-family:${DISPLAY};font-size:24px;font-weight:800;color:${COLORS.foreground};">${escapeHtml(content.title)}</h1>
${content.intro.map(paragraph).join("\n")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr>
<td style="background:${COLORS.primary};border-radius:8px;">
<a href="${url}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:700;color:${COLORS.primaryForeground};text-decoration:none;">${escapeHtml(content.button.label)}</a>
</td></tr></table>
${content.outro.map(paragraph).join("\n")}
<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${COLORS.muted};">${escapeHtml(content.fallback)}<br><a href="${url}" style="color:${COLORS.primary};word-break:break-all;">${url}</a></p>
</td></tr>
<tr><td style="padding:24px 8px 0;font-size:12px;line-height:1.6;color:${COLORS.muted};text-align:center;">${escapeHtml(content.footer)}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Versión en texto plano, para clientes sin HTML y para la consola en desarrollo. */
export function renderText(content: EmailContent): string {
  return [
    content.title,
    "",
    ...content.intro,
    "",
    `${content.button.label}: ${content.button.url}`,
    "",
    ...content.outro,
    "",
    "— Kaname",
  ].join("\n");
}
