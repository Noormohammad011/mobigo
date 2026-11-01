"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { AdminActionState } from "@/lib/admin/catalog-schemas"
import { requireAdminOrders } from "@/lib/admin/guard"
import { getCurrentUser } from "@/lib/auth/session"
import type { OrderStatus } from "@/generated/prisma/client"
import { markOrderPaid, transitionOrder } from "@/lib/orders/transition-order"

const statusSchema = z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"])

export const transitionOrderAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminOrders("/admin/orders")
  const user = await getCurrentUser()
  if (!user) return { error: "Sign in again." }

  const orderId = String(formData.get("orderId") ?? "")
  const toStatusRaw = String(formData.get("toStatus") ?? "")
  const noteRaw = formData.get("note")
  const note = typeof noteRaw === "string" ? noteRaw : null

  if (!z.string().cuid().safeParse(orderId).success) return { error: "Invalid order." }
  const parsedStatus = statusSchema.safeParse(toStatusRaw)
  if (!parsedStatus.success) return { error: "Pick a valid status." }

  const result = await transitionOrder({
    orderId,
    toStatus: parsedStatus.data as OrderStatus,
    note,
    actorId: user.id,
  })

  if (!result.ok) return { error: result.error }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}

export const markOrderPaidAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminOrders("/admin/orders")
  const orderId = String(formData.get("orderId") ?? "")
  if (!z.string().cuid().safeParse(orderId).success) return { error: "Invalid order." }

  const result = await markOrderPaid(orderId)
  if (!result.ok) return { error: result.error }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}

export const markOrderPaidFormAction = async (formData: FormData) => {
  await markOrderPaidAction(undefined, formData)
}
