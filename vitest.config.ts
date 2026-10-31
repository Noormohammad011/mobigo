import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const src = fileURLToPath(new URL("./src", import.meta.url))
const empty = fileURLToPath(new URL("./src/test/empty.ts", import.meta.url))
const alias = { "@": src, "server-only": empty }

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.db.test.ts"],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "component",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["src/test/setup/jest-dom.ts", "src/test/setup/next.ts"],
          css: false,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "db",
          environment: "node",
          include: ["src/**/*.db.test.ts"],
          exclude: ["src/**/*.race.db.test.ts"],
          setupFiles: ["src/test/setup/db.ts"],
          globalSetup: ["src/test/global-setup.ts"],
          testTimeout: 30_000,
          fileParallelism: true,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "db-race",
          environment: "node",
          include: ["src/**/*.race.db.test.ts"],
          globalSetup: ["src/test/global-setup.ts"],
          fileParallelism: false,
          testTimeout: 30_000,
        },
      },
    ],
  },
})
