// Vite config padrão — independente da Lovable.
// Stack: TanStack Start + React 19 + Tailwind v4.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
