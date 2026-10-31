import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.E2E_PORT ?? 3130)
if (port === 3000 || (port >= 3123 && port <= 3129)) {
  throw new Error(`E2E_PORT ${port} is reserved. Use 3130 or another free port.`)
}
const baseURL = `http://localhost:${port}`

const serverEnv = {
  DATABASE_URL: process.env.E2E_DATABASE_URL ?? "postgresql://mobigo:mobigo@localhost:5432/mobigo_e2e",
  DIRECT_URL: process.env.E2E_DATABASE_URL ?? "postgresql://mobigo:mobigo@localhost:5432/mobigo_e2e",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  NEXT_PUBLIC_SITE_URL: baseURL,
  NEXT_DIST_DIR: ".next-e2e",
  NODE_ENV: "production",
  PATH: process.env.PATH ?? "",
  HOME: process.env.HOME ?? "",
  E2E_SUPABASE_SECRET_KEY: "",
}

export default defineConfig({
  testDir: "e2e",
  globalSetup: "e2e/global-setup.ts",
  globalTeardown: "e2e/global-teardown.ts",
  use: { baseURL },
  projects: [
    { name: "phone", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `pnpm exec next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    env: serverEnv,
  },
})
