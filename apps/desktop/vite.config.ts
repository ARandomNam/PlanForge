import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.ts",
        onstart(options) {
          if (options.startup) {
            options.startup();
          }
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: "dist-electron",
            rollupOptions: {
              external: [
                "keytar",
                "sqlite3",
                "@prisma/client",
                ".prisma/client",
                "prisma",
              ],
            },
          },
        },
      },
      {
        entry: "electron/preload.ts",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            sourcemap: "inline",
            minify: false,
            outDir: "dist-electron",
            rollupOptions: {
              external: [
                "keytar",
                "sqlite3",
                "@prisma/client",
                ".prisma/client",
                "prisma",
              ],
            },
          },
        },
      },
      {
        entry: "electron/database.ts",
        onstart() {
          // Database service doesn't need to restart on changes
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: "dist-electron",
            rollupOptions: {
              external: [
                "@prisma/client",
                ".prisma/client",
                "prisma",
                "sqlite3",
              ],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ["@prisma/client", ".prisma/client", "prisma"],
    },
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ["@prisma/client", ".prisma/client", "prisma"],
  },
});
