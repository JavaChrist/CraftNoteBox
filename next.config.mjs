import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Alias des noms Supabase CLI / dashboard : rend URL + clé anon dispo (client, proxy, RSC).
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      "",
  },
  experimental: {
    serverActions: {
      /** Imports page-media (images redimensionnées + pièces jointes) via FormData. */
      bodySizeLimit: "52mb",
    },
  },
  /** Aide Turbopack à résoudre `postcss` (Tailwind) sur certains environnements Windows. */
  turbopack: {
    resolveAlias: {
      postcss: path.join(__dirname, "node_modules", "postcss"),
    },
  },
};

export default nextConfig;

