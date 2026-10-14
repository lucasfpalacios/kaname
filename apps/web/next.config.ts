import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @kaname/ui se publica como código TypeScript: Next lo compila.
  transpilePackages: ["@kaname/ui"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
