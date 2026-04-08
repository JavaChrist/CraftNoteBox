import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { themeInitScript } from "@/lib/theme-inline-script";

export const metadata: Metadata = {
  title: "CraftNoteBox",
  description: "Éditeur type Notion en Next.js + Slate + Firebase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <div className="fixed right-3 top-3 z-[100] sm:right-4 sm:top-4">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}

