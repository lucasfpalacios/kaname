import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: "./",
    setupFiles: ["./test/support/setup-env.ts"],
    include: ["**/*.e2e-spec.ts"],
  },
});
