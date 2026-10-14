// API NestJS: Node, con reglas que usan los tipos (necesita tsconfigRootDir del paquete).
import { defineConfig } from "eslint/config";
import globals from "globals";
import base from "./base.js";

/** @param {{ tsconfigRootDir: string }} options */
export function nest({ tsconfigRootDir }) {
  return defineConfig([
    base,
    { languageOptions: { globals: globals.node } },
    {
      files: ["**/*.ts"],
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        // Una promesa sin await en un controller o servicio es un error silencioso.
        "@typescript-eslint/no-floating-promises": "error",
      },
    },
  ]);
}
