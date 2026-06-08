import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prefer .tsx/.ts over .js so updated TypeScript files shadow old .js copies
    extensions: [".mjs", ".mts", ".ts", ".tsx", ".jsx", ".js", ".json", ".node"],
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
  },
});
