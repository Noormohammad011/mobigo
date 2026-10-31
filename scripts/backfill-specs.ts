/**
 * Idempotent spec backfill for hosted DB (spec 0015).
 * Usage: pnpm exec tsx scripts/backfill-specs.ts --target=localhost
 */
import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"
import { ensureSpecCatalog, upsertProductSpecs } from "../prisma/spec-sheet"

const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "db"])

const parseTarget = (): string => {
  const arg = process.argv.find((entry) => entry.startsWith("--target="))
  if (!arg) {
    console.error("Refusing to run: pass --target=localhost or your Supabase pool host explicitly.")
    process.exit(1)
  }
  return arg.slice("--target=".length)
}

const main = async () => {
  const target = parseTarget()
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? ""
  let host = ""
  try {
    host = new URL(url).hostname
  } catch {
    console.error("DATABASE_URL or DIRECT_URL is missing or invalid.")
    process.exit(1)
  }

  if (target === "localhost") {
    if (!ALLOWED_HOSTS.has(host)) {
      console.error(`Refusing: DB host is ${host}, but --target=localhost was passed.`)
      process.exit(1)
    }
  } else if (host !== target) {
    console.error(`Refusing: DB host ${host} does not match --target=${target}.`)
    process.exit(1)
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
  const attrIds = await ensureSpecCatalog(db)
  const products = await db.product.findMany({
    select: {
      id: true,
      slug: true,
      displaySizeIn: true,
      batteryMah: true,
      chipsetBrand: true,
      network: true,
      ramOptionsGb: true,
      storageOptionsGb: true,
    },
  })

  for (const product of products) {
    await upsertProductSpecs(
      db,
      {
        id: product.id,
        slug: product.slug,
        displaySizeIn: product.displaySizeIn ? Number(product.displaySizeIn) : null,
        batteryMah: product.batteryMah,
        chipsetBrand: product.chipsetBrand,
        network: product.network,
        ramOptionsGb: product.ramOptionsGb,
        storageOptionsGb: product.storageOptionsGb,
      },
      attrIds
    )
  }

  console.log(`Backfilled specs for ${products.length} products on ${host}.`)
  await db.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
