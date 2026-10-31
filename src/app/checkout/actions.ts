"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { getCurrentUser } from "@/lib/auth/session"
import { normalizeBdPhone } from "@/lib/auth/phone"
import { divisionForDistrict } from "@/lib/bd-locations"
import { track } from "@/lib/analytics"
import { db } from "@/lib/db"
import { getCheckoutLinesForUser, placeOrder, resolveCheckoutLines, type CheckoutLineInput } from "@/lib/orders/place-order"

const checkoutSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerPhone: z.string().trim(),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  district: z.string().trim().min(1),
  area: z.string().trim().min(1).max(100),
  addressLine: z.string().trim().min(1).max(300),
  note: z.string().trim().max(500).optional(),
})

export type PlaceOrderState =
  | { ok: true }
  | { ok: false; message: string; lineIssues?: { variantId: string; message: string }[] }

export async function placeOrderAction(
  guestLines: CheckoutLineInput[],
  _prev: PlaceOrderState | null,
  formData: FormData
): Promise<PlaceOrderState> {
  const user = await getCurrentUser()
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail") || "",
    district: formData.get("district"),
    area: formData.get("area"),
    addressLine: formData.get("addressLine"),
    note: formData.get("note") || "",
  })
  if (!parsed.success) {
    return { ok: false, message: "Check your name, phone, and address." }
  }

  const phone = normalizeBdPhone(parsed.data.customerPhone)
  if (!phone) return { ok: false, message: "Enter a valid mobile number (01XXXXXXXXX)." }

  const division = divisionForDistrict(parsed.data.district)
  if (!division) return { ok: false, message: "Choose a district we deliver to." }

  const zoneDistrict = await db.deliveryZoneDistrict.findUnique({
    where: { district: parsed.data.district },
    select: { zoneId: true },
  })
  if (!zoneDistrict) return { ok: false, message: "Choose a district we deliver to." }

  const lines = user ? await getCheckoutLinesForUser(user.id) : guestLines
  const preview = await resolveCheckoutLines(lines)
  if (!preview.ok) {
    return { ok: false, message: "Some items changed. Review your cart.", lineIssues: preview.issues }
  }

  track({ name: "checkout_start", itemCount: preview.lines.length })

  const result = await placeOrder({
    userId: user?.id ?? null,
    customerName: parsed.data.customerName,
    customerPhone: phone,
    customerEmail: parsed.data.customerEmail || null,
    division,
    district: parsed.data.district,
    area: parsed.data.area,
    addressLine: parsed.data.addressLine,
    note: parsed.data.note || null,
    deliveryZoneId: zoneDistrict.zoneId,
    lines,
  })

  if (!result.ok) {
    return {
      ok: false,
      message: result.message,
      lineIssues: result.lineIssues,
    }
  }

  track({ name: "order_placed", orderNumber: result.orderNumber })
  redirect(`/checkout/confirmation?order=${encodeURIComponent(result.orderNumber)}`)
}
