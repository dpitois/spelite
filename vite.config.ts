import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

import { execSync } from "child_process";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const commitDate = execSync("git log -1 --format=%cd --date=format:'%Y.%m.%d'")
  .toString()
  .trim();

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || "./",
  define: {
    __COMMIT_DATE__: JSON.stringify(commitDate),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    preact(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tailwindcss() as any,
    VitePWA({
      registerType: "prompt",
      includeAssets: ["pwa-icon.svg"],
      manifest: {
        name: "Spelite - D&D 5e Spell Manager",
        short_name: "Spelite",
        description: "Minimalist D&D 5e spell management",
        theme_color: "#1c1917",
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "pwa-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
