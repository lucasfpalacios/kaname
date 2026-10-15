import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import react from "@vitejs/plugin-react";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-themes"],
  core: { disableTelemetry: true },
  viteFinal: (vite) => ({
    ...vite,
    plugins: [...(vite.plugins ?? []), react(), tailwindcss()],
  }),
};

export default config;
