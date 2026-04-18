import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GL Cuisines — Pilotage chantier",
  description: "Outil de pilotage chantier GL Cuisines",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
