import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

export const metadata: Metadata = {
  title: {
    default: "Koçluk — Eğitim Koçluğu Platformu",
    template: "%s · Koçluk",
  },
  description:
    "Koçluk; öğrenci takibi, randevu, net analizi ve koçluk görüşmelerini tek platformda buluşturan eğitim koçluğu sistemidir.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            <AppHeader />
            <main className="mx-auto w-full max-w-(--spacing-container) flex-1 px-4 py-10 sm:px-6 sm:py-12">
              {children}
            </main>
            <AppFooter />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
