import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// One ES module, no code splitting and no external requests.
export default defineConfig({
  build: {
    target: "es2021",
    lib: {
      entry: resolve(__dirname, "src/emby-library-card.ts"),
      formats: ["es"],
      fileName: () => "emby-library-card.js",
    },
    outDir: resolve(__dirname, "../custom_components/emby_library/frontend"),
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
