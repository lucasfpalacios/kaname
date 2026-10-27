import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// La API (Nest). En el navegador todo va a /api/* del mismo origen y Next lo reenvía acá, así la
// web y la API comparten sitio y las cookies de sesión (SameSite=Lax) viajan. Sin NEST_URL se usa
// la API local de `pnpm dev`.
const nestUrl = (process.env.NEST_URL ?? "http://localhost:4000").replace(
  /\/$/,
  "",
);

// Headers de seguridad de las páginas (las respuestas de /api/* traen los de la API, con helmet).
// La CSP permite scripts y estilos en línea: Next y next-themes los usan, y con nonces cada
// página sería dinámica. En desarrollo, además, eval y el websocket de recarga.
const isDev = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Fotos de perfil de Google.
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // @kaname/ui se publica como código TypeScript: Next lo compila.
  transpilePackages: ["@kaname/ui"],
  cacheComponents: true,
  partialPrefetching: true,
  // beforeFiles: /api/* nunca llega a las rutas de la app. El proxy (src/proxy.ts) agrega antes la
  // IP del cliente y el secreto compartido con la API.
  async headers() {
    return [{ source: "/((?!api/).*)", headers: securityHeaders }];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/api/:path*", destination: `${nestUrl}/api/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
