import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { themeScript } from "@/features/theme/theme";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevShelf",
    template: "%s | DevShelf",
  },
  description: "Organize e apresente tudo o que você já desenvolveu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o script do tema altera a classe do <html> antes da hidratação
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Primeiro item da tabulação: leva direto ao conteúdo, pulando o header */}
        <a
          href="#conteudo"
          className="sr-only rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
