import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({command, mode}) => {
  const config = loadEnv(mode, process.cwd(), "");
  const api = process.env.VITE_API_BASE_URL || config.VITE_API_BASE_URL;
  if (command === "build" && (!api || (api !== "/api" && (!api.startsWith("https://") || new URL(api).pathname !== "/api")))) {
    throw new Error("Production VITE_API_BASE_URL must be /api or an HTTPS URL ending in /api");
  }
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
        "@dsa": path.resolve(__dirname, "../dsa"),
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/motion/")) {
              return "vendor-motion";
            }
            if (id.includes("node_modules/lucide-react/")) {
              return "vendor-lucide";
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
