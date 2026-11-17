import type { NextConfig } from "next";

// GitHub Pages: export estático servido em https://<usuario>.github.io/projeto-s05/
// Ative com PAGES_BASE_PATH=/projeto-s05 (o workflow .github/workflows/pages.yml faz isso).
const basePath = process.env.PAGES_BASE_PATH ?? "";
const isPages = basePath !== "";

const nextConfig: NextConfig = {
  ...(isPages
    ? { output: "export" as const, basePath, trailingSlash: true, images: { unoptimized: true } }
    : {}),
  // PPR não existe em export estático: liga só no modo servidor.
  cacheComponents: !isPages,
  partialPrefetching: !isPages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
