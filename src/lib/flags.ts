import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { notFound } from "next/navigation"

import { db } from "@/lib/db"

/** One name per planned feature. Missing or off means the feature stays dark. */
export const FLAG_NAMES = [
  "feature_flags",
  "analytics",
  "available_stock",
  "product_listing",
  "product_detail",
  "search",
  "sitemap",
  "recently_viewed",
  "cart",
  "cod_checkout",
  "order_tracking",
  "order_history",
  "wishlist",
  "full_spec_data",
  "spec_columns",
  "compare",
  "admin_catalog",
  "admin_merchandising",
  "admin_orders",
  "admin_settings",
] as const

export type FlagName = (typeof FLAG_NAMES)[number]

const FLAG_KEY = "feature_flags"

const defaults = (): Record<FlagName, boolean> =>
  Object.fromEntries(FLAG_NAMES.map((name) => [name, false])) as Record<FlagName, boolean>

const isFlagName = (name: string): name is FlagName => (FLAG_NAMES as readonly string[]).includes(name)

/** Parses FLAGS env (spec 0003). Left to right; all=on then buy=off is valid. */
export const parseFlagsEnv = (raw: string | undefined): Partial<Record<FlagName, boolean>> => {
  if (!raw?.trim()) return {}
  const patch: Partial<Record<FlagName, boolean>> = {}
  for (const part of raw.split(",").map((entry) => entry.trim()).filter(Boolean)) {
    if (part === "all=on") {
      for (const name of FLAG_NAMES) patch[name] = true
      continue
    }
    if (part === "all=off") {
      for (const name of FLAG_NAMES) patch[name] = false
      continue
    }
    const eq = part.indexOf("=")
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (!isFlagName(key)) continue
    if (value === "on") patch[key] = true
    if (value === "off") patch[key] = false
  }
  return patch
}

/** Server read. Code defaults are off. A Setting row named feature_flags can turn names on without a deploy. */
export const readFlags = async (): Promise<Record<FlagName, boolean>> => {
  "use cache"
  cacheTag("feature_flags")
  cacheLife("minutes")
  const flags = defaults()
  try {
    const row = await db.setting.findUnique({ where: { key: FLAG_KEY } })
    if (!row || typeof row.value !== "object" || row.value === null || Array.isArray(row.value)) return flags
    for (const name of FLAG_NAMES) {
      const value = (row.value as Record<string, unknown>)[name]
      if (typeof value === "boolean") flags[name] = value
    }
  } catch (error) {
    console.error("[flags] database read failed; all flags off", error)
  }
  return flags
}

/** Database flags plus FLAGS env outside production (spec 0003 AC-4). */
export const getFlags = async (): Promise<Record<FlagName, boolean>> => {
  const flags = await readFlags()
  if (process.env.VERCEL_ENV === "production") return flags
  return { ...flags, ...parseFlagsEnv(process.env.FLAGS) }
}

/** Hide a page when its flag is off. The shopper gets a not found response, not a half built screen. */
export const assertFlag = async (name: FlagName): Promise<void> => {
  const flags = await getFlags()
  if (!flags[name]) notFound()
}

export const isFlagOn = async (name: FlagName): Promise<boolean> => (await getFlags())[name]
