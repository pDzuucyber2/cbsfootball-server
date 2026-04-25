import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {

      // 🔵 API yako
      "/api": {
        target: "https://api.sportmonks.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },

      // 🔥 LOGO PROXY
      "/logos": {
        target: "https://crests.football-data.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/logos/, ""),
      },

    },
  },
});