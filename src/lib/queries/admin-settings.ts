import "server-only"

import { db } from "@/lib/db"

export const CONTACT_SETTING_KEYS = [
  "support_phone",
  "support_email",
  "whatsapp_number",
  "facebook_url",
  "youtube_url",
  "order_max_subtotal",
] as const

export const getAdminContactSettings = async () => {
  const rows = await db.setting.findMany({
    where: { key: { in: [...CONTACT_SETTING_KEYS] } },
  })
  const value = (key: string) => {
    const row = rows.find((r) => r.key === key)?.value
    if (typeof row === "string") return row
    if (typeof row === "number") return String(row)
    return ""
  }
  return {
    support_phone: value("support_phone"),
    support_email: value("support_email"),
    whatsapp_number: value("whatsapp_number"),
    facebook_url: value("facebook_url"),
    youtube_url: value("youtube_url"),
    order_max_subtotal: value("order_max_subtotal"),
  }
}

export const listAdminPages = () =>
  db.page.findMany({
    orderBy: { title: "asc" },
    select: { id: true, slug: true, title: true, isPublished: true, updatedAt: true },
  })

export const getAdminPage = (id: string) => db.page.findUnique({ where: { id } })

export const listAdminOutlets = () => db.outlet.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })

export const getAdminOutlet = (id: string) => db.outlet.findUnique({ where: { id } })

export const listAdminDeliveryZones = () =>
  db.deliveryZone.findMany({
    orderBy: { name: "asc" },
    include: { districts: { orderBy: { district: "asc" } }, _count: { select: { orders: true } } },
  })

export const getAdminDeliveryZone = (id: string) =>
  db.deliveryZone.findUnique({
    where: { id },
    include: { districts: { orderBy: { district: "asc" } } },
  })
