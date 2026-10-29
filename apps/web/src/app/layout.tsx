import type { Metadata } from "next";
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { type ReactNode, Suspense } from "react";
import { ThemeProvider } from "@kaname/ui";
import { defaultLocale } from "@/i18n/locale";
import { DocumentLang } from "./document-lang";
import "./globals.css";

// Las variables las consume @kaname/ui (font-display / font-sans).
const display = Shippori_Mincho_B1({
  variable: "--kaname-font-display",
  weight: ["600", "800"],
  subsets: ["latin"],
});

const sans = Zen_Kaku_Gothic_New({
  variable: "--kaname-font-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("title"), description: t("description") };
}

// Un solo layout raíz para los dos idiomas: las URLs no llevan el idioma. El <html> y el tema son
// estáticos; los textos dependen del idioma del pedido (cookie), así que van dentro de Suspense.
// Cambiar de idioma es un router.refresh(): la página se vuelve a renderizar con los textos
// nuevos sin recargar el documento.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={defaultLocale}
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Suspense fallback={<div className="min-h-dvh bg-background" />}>
            <IntlProviders>{children}</IntlProviders>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

async function IntlProviders({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  // Los textos de /ui-kit (solo desarrollo) no viajan a las demás páginas: esa ruta los pasa con
  // su propio provider.
  const messages = Object.fromEntries(
    Object.entries(await getMessages()).filter(
      ([namespace]) => namespace !== "UiKit",
    ),
  );
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocumentLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
