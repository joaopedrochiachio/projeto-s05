import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Portal Inatel & Mural NESP — Sistema Acadêmico",
  description:
    "Portal Acadêmico do Inatel integrado ao Mural de Vagas de Estágio do NESP. Trabalho Final de IHC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      data-theme="inatel"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="antialiased">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
