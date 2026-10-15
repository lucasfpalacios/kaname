import type { Metadata } from "next";
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ThemeProvider } from "@kaname/ui";
import { routing } from "@/i18n/routing";
import "../globals.css";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Los textos de /ui-kit (solo desarrollo) no viajan a las demás páginas: esa ruta los pasa con
  // su propio provider.
  const messages = Object.fromEntries(
    Object.entries(await getMessages()).filter(
      ([namespace]) => namespace !== "UiKit",
    ),
  );

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
