import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests de la lógica de la web que no necesita navegador (sesión, rutas, cliente de la API).
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
