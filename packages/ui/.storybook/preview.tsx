import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/react-vite";
import "./preview.css";

// El kit no traduce: el idioma elegido en la barra llega a las stories como globals.locale
// y ellas pasan los textos por props. Acá solo se refleja en <html lang>.
const withLocale: Decorator = (Story, { globals }) => {
  document.documentElement.lang = globals.locale as string;
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    locale: {
      description: "Idioma",
      toolbar: {
        title: "Idioma",
        icon: "globe",
        items: [
          { value: "es", title: "Español" },
          { value: "en", title: "English" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: "es" },
  decorators: [
    withThemeByClassName({
      themes: { claro: "", oscuro: "dark" },
      defaultTheme: "claro",
    }),
    withLocale,
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
  },
};

export default preview;
