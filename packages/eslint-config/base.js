// Base para todos los paquetes TypeScript del monorepo.
import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export const ignores = globalIgnores([
  "**/dist/**",
  "**/.next/**",
  "**/coverage/**",
  "**/src/generated/**",
  "**/next-env.d.ts",
]);

export default defineConfig([
  ignores,
  js.configs.recommended,
  tseslint.configs.recommended,
  // Al final: apaga las reglas de formato, que son de Prettier.
  prettier,
]);
