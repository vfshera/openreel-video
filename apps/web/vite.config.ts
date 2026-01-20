import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@openreel/core": path.resolve(__dirname, "../../packages/core/src"),
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "@ffmpeg/core", "@ffmpeg/core-mt"],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          zustand: ["zustand"],
        },
      },
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
