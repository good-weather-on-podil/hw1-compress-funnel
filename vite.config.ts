import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const coopCoep = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  plugins: [react()],
  worker: { format: "es" },
  optimizeDeps: { exclude: ["@jspawn/ghostscript-wasm"] },
  server: { headers: coopCoep },
  preview: { headers: coopCoep },
  assetsInclude: ["**/*.wasm"],
});
