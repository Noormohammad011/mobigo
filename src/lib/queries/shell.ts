import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { db } from "@/lib/db"

/** Brands for the header brand nav and the footer (featured first, then sortOrder). */
export async function getNavBrands(): Promise<{ name: string; slug: string }[]> {
  "use cache"
  cacheLife("hours")
  cacheTag("brands")

  return db.brand.findMany({
    select: { name: true, slug: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    take: 12,
  })
}

export type StoreContact = {
  phone: string | null
  email: string | null
  /** Digits only, for wa.me links, e.g. "8801712345678". */
  whatsapp: string | null
  socials: { facebook: string | null; youtube: string | null }
  outlets: { name: string; address: string; phone: string | null; mapUrl: string | null; hours: string | null }[]
}

/** Contact details, socials and outlets from the Setting and Outlet tables. Every field may be empty. */
export async function getStoreContact(): Promise<StoreContact> {
  "use cache"
  cacheLife("hours")
  cacheTag("settings", "outlets")

  const [settings, outlets] = await Promise.all([
    db.setting.findMany({
      where: { key: { in: ["support_phone", "support_email", "whatsapp_number", "facebook_url", "youtube_url"] } },
    }),
    db.outlet.findMany({
      select: { name: true, address: true, phone: true, mapUrl: true, hours: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  const text = (key: string) => {
    const v = settings.find((s) => s.key === key)?.value
    return typeof v === "string" && v.trim() ? v.trim() : null
  }
  const whatsapp = text("whatsapp_number")?.replace(/\D/g, "") || null

  return {
    phone: text("support_phone"),
    email: text("support_email"),
    whatsapp,
    socials: { facebook: text("facebook_url"), youtube: text("youtube_url") },
    outlets,
  }
}
