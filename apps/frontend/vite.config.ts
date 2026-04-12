import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      // Only measure coverage on files with meaningful business logic.
      // Entry points (main/App), visual animation components, and mock data
      // are excluded — they have no testable business logic.
      include: [
        "src/hooks/**",
        "src/components/features/Layout.tsx",
        "src/components/features/ProtectedRoute.tsx",
        "src/routes/auth/AuthCallbackPage.tsx",
        "src/routes/profile/ProfileEditPage.tsx",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
