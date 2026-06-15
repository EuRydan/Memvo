import type { Metadata } from "next";
import { Raleway, Hind_Guntur, Signika_Negative } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const hindGuntur = Hind_Guntur({
  variable: "--font-hind",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const signika = Signika_Negative({
  variable: "--font-signika",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memvor — Cada momento, compartilhado.",
  description: "Crie um álbum compartilhado para sua celebração. Seus convidados escaneiam, fotografam e compartilham — instantaneamente.",
};

import { RealtimeToast } from "@/components/RealtimeToast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/contexts/I18nContext";
import { CookieConsentWrapper } from "@/components/CookieConsentWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${raleway.variable} ${hindGuntur.variable} ${signika.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script src="https://www.mercadopago.com/v2/security.js" {...{ view: 'checkout' }} async></script>
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-ink transition-colors duration-200" suppressHydrationWarning>
        <I18nProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <RealtimeToast />
            <CookieConsentWrapper />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
