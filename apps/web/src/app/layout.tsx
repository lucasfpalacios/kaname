import type { Metadata } from "next";
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import { ThemeProvider } from "@kaname/ui";
import "./globals.css";

// Las variables las consume @kaname/ui (font-display / font-sans).
const display = Shippori_Mincho_B1({
  variable: "--kaname-font-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const sans = Zen_Kaku_Gothic_New({
  variable: "--kaname-font-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaname",
  description: "Administrá todos tus emprendimientos desde un solo panel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
