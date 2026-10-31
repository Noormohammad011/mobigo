"use server"

import { headers } from "next/headers"

import { normalizeBdPhone } from "@/lib/auth/phone"
import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit/memory"

export type TrackOrderState =
  | { ok: true; orderNumber: string; status: string; timeline: { label: string; at: Date }[] }
  | { ok: false; message: string }

export async function trackOrderAction(_prev: TrackOrderState | null, formData: FormData): Promise<TrackOrderState> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  if (!checkRateLimit(`track:${ip}`, 15, 60 * 60 * 1000)) {
    return { ok: false, message: "Too many attempts. Try again in a little while." }
  }

  const orderNumber = String(formData.get("orderNumber") ?? "").trim()
  const phone = normalizeBdPhone(String(formData.get("phone") ?? ""))
  if (!orderNumber || !phone) {
    return { ok: false, message: "We could not find an order with those details." }
  }

  const order = await db.order.findFirst({
    where: { orderNumber, customerPhone: phone },
    select: {
      orderNumber: true,
      status: true,
      statusHistory: { orderBy: { createdAt: "asc" }, select: { toStatus: true, createdAt: true, note: true } },
    },
  })

  if (!order) {
    return { ok: false, message: "We could not find an order with those details." }
  }

  const timeline = order.statusHistory.map((row) => ({
    label: row.note ?? row.toStatus.replace(/_/g, " "),
    at: row.createdAt,
  }))

  return { ok: true, orderNumber: order.orderNumber, status: order.status, timeline }
}
