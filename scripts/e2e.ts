import { execFileSync, spawnSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import pg from "pg"

import { assertLocalTestDatabase } from "../src/test/guard"

const HOSTED_REF = "mvytuzvpibveecixtlvi"
const E2E_URL = process.env.E2E_DATABASE_URL ?? "postgresql://mobigo:mobigo@localhost:5432/mobigo_e2e"
const port = Number(process.env.E2E_PORT ?? 3130)

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

const quoteIdent = (name: string) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) fail(`Refusing to create database "${name}".`)
  return `"${name}"`
}

const ensureDatabase = async () => {
  assertLocalTestDatabase(E2E_URL)
  const admin = new URL(E2E_URL)
  const dbName = decodeURIComponent(admin.pathname.replace(/^\//, ""))
  admin.pathname = "/postgres"
  const client = new pg.Client({ connectionString: admin.toString(), connectionTimeoutMillis: 2_000 })
  try {
    await client.connect()
  } catch {
    fail("database unreachable. Run pnpm db:up")
  }
  const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName])
  if (existing.rowCount === 0) {
    try {
      await client.query(`CREATE DATABASE ${quoteIdent(dbName)}`)
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""
      if (code !== "42P04") throw error
    }
  }
  await client.end()
}

const localSupabase = async () => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3_000)
  try {
    const response = await fetch("http://127.0.0.1:54321/auth/v1/health", { signal: controller.signal })
    if (!response.ok) fail("local Supabase not answering. Run pnpm supabase:start")
  } catch {
    fail("local Supabase not answering. Run pnpm supabase:start")
  } finally {
    clearTimeout(timer)
  }
  const status = spawnSync("pnpm", ["exec", "supabase", "status", "-o", "env"], { encoding: "utf8" })
  if (status.status !== 0) fail("local Supabase not answering. Run pnpm supabase:start")
  const env: Record<string, string> = {}
  for (const line of status.stdout.split("\n")) {
    const match = /^([A-Z0-9_]+)="?(.*?)"?$/.exec(line.trim())
    if (match) env[match[1]] = match[2]
  }
  const apiUrl = env.API_URL
  const publishable = env.PUBLISHABLE_KEY ?? env.ANON_KEY
  const secret = env.SECRET_KEY ?? env.SERVICE_ROLE_KEY
  if (!apiUrl || !publishable || !secret) fail("supabase status did not print API_URL and both keys.")
  for (const value of [apiUrl]) {
    const host = new URL(value).hostname.replace(/^\[|\]$/g, "")
    if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
      fail(`Refusing Supabase URL ${value}. End to end tests only talk to a local address.`)
    }
  }
  return { apiUrl, publishable, secret }
}

const scanBuild = (dir: string) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const info = statSync(path)
    if (info.isDirectory()) {
      scanBuild(path)
      continue
    }
    if (info.size > 5_000_000) continue
    const text = readFileSync(path)
    if (text.includes(HOSTED_REF)) fail(`Hosted Supabase ref found in ${path}. The e2e build must stay local.`)
  }
}

const main = async () => {
  if (port === 3000 || (port >= 3123 && port <= 3129)) fail(`E2E_PORT ${port} is reserved. Use 3130.`)
  if (!existsSync("src/generated/prisma/client.ts")) fail("generated Prisma client missing. Run pnpm db:generate")
  await ensureDatabase()
  const supabase = await localSupabase()
  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    DATABASE_URL: E2E_URL,
    DIRECT_URL: E2E_URL,
    NEXT_PUBLIC_SUPABASE_URL: supabase.apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabase.publishable,
    NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
    NEXT_DIST_DIR: ".next-e2e",
    E2E_PORT: String(port),
    E2E_SUPABASE_SECRET_KEY: supabase.secret,
  }
  delete childEnv.SUPABASE_SERVICE_ROLE_KEY
  execFileSync("pnpm", ["exec", "prisma", "migrate", "reset", "--force", "--skip-seed"], {
    env: childEnv,
    stdio: "inherit",
  })
  execFileSync("pnpm", ["exec", "tsx", "prisma/seed.ts"], { env: childEnv, stdio: "inherit" })
  if (process.env.E2E_SKIP_BUILD !== "1") {
    execFileSync("pnpm", ["exec", "next", "build"], { env: childEnv, stdio: "inherit" })
    scanBuild(".next-e2e")
  }
  const ui = process.argv.includes("--ui")
  const result = spawnSync("pnpm", ["exec", "playwright", "test", ...(ui ? ["--ui"] : [])], {
    env: childEnv,
    stdio: "inherit",
  })
  process.exit(result.status ?? 1)
}

void main()
