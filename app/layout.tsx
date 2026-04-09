import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { themeInitScript } from "@/lib/theme-inline-script";
import {
  BRAND_APPLE_TOUCH,
  BRAND_FAVICON,
  BRAND_ICON_192,
  BRAND_MANIFEST,
} from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: "CraftNoteBox",
  description: "Éditeur type Notion — Next.js, Slate, Supabase",
  manifest: BRAND_MANIFEST,
  icons: {
    icon: [
      { url: BRAND_FAVICON, type: "image/png", sizes: "32x32" },
      { url: BRAND_ICON_192, type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: BRAND_APPLE_TOUCH, sizes: "180x180", type: "image/png" },
    ],
  },
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

