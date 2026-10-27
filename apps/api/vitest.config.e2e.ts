import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: "./",
    // Base separada (kaname_test): nunca toca la de desarrollo. Ver test/support/test-database.ts.
    globalSetup: ["./test/support/global-setup-e2e.ts"],
    setupFiles: [
      "./test/support/setup-env.ts",
      "./test/support/setup-env-e2e.ts",
    ],
    include: ["**/*.e2e-spec.ts"],
  },
});
