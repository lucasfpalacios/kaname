import react from "@kaname/eslint-config/react";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  react,
  storybook.configs["flat/recommended"],
  globalIgnores(["storybook-static/**", "!.storybook"]),
]);
