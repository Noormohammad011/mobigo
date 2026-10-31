import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"

import pg from "pg"

import { assertLocalTestDatabase } from "./guard"

const url = process.env.TEST_DATABASE_URL ?? "postgresql://mobigo:mobigo@localhost:5432/mobigo_test"

const quoteIdent = (name: string) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error(`Refusing to create database "${name}".`)
  return `"${name}"`
}

export default async function setup() {
  if (!existsSync("src/generated/prisma/client.ts")) {
    console.error("generated Prisma client missing. Run pnpm db:generate")
    process.exit(1)
  }
  assertLocalTestDatabase(url)
  const admin = new URL(url)
  const dbName = decodeURIComponent(admin.pathname.replace(/^\//, ""))
  admin.pathname = "/postgres"
  const client = new pg.Client({ connectionString: admin.toString(), connectionTimeoutMillis: 2_000 })
  try {
    await client.connect()
  } catch {
    console.error("database unreachable. Run pnpm db:up")
    process.exit(1)
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
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
    stdio: "inherit",
  })
}
