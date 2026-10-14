// App Next.js: reglas oficiales de Next (incluyen React, hooks, a11y y TypeScript).
import prettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig } from "eslint/config";
import { ignores } from "./base.js";

export default defineConfig([ignores, nextVitals, nextTs, prettier]);
