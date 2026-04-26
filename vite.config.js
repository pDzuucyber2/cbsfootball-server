import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // 🔥 PWA (INSTALL APP)
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // hata localhost itaonyesha install
      },
      manifest: {
        name: "ContraBetScore",
        short_name: "CBS",
        description: "Best betting platform",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#00ff66",
        icons: [
          {
            src: "/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {

      // 🔵 API yako (HAIJAGUSWA)
      "/api": {
        target: "https://api.sportmonks.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },

      // 🔥 LOGO PROXY (HAIJAGUSWA)
      "/logos": {
        target: "https://crests.football-data.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/logos/, ""),
      },

    },
  },
});