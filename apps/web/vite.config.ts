import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Critical Ops Tracker",
        short_name: "COPS Tracker",
        description: "Critical Ops player stats, ranks & history.",
        theme_color: "#ff6a1a",
        background_color: "#0a0c10",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Never serve the SPA shell for API calls.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    port: 5173,
    // Proxy API calls to the Fastify server during development.
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
