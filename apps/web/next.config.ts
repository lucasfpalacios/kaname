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

const nextConfig: NextConfig = {
  // @kaname/ui se publica como código TypeScript: Next lo compila.
  transpilePackages: ["@kaname/ui"],
  cacheComponents: true,
  partialPrefetching: true,
  // beforeFiles: /api/* nunca llega a las rutas de la app. El proxy (src/proxy.ts) agrega antes la
  // IP del cliente y el secreto compartido con la API.
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
