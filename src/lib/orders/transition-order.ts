import "server-only"

import type { OrderStatus } from "@/generated/prisma/client"
import { db } from "@/lib/db"
import {
  deliverVariantStock,
  releaseVariantReserve,
  restockVariant,
  syncProductInStock,
} from "@/lib/orders/checkout-settings"
import {
  isAllowedOrderTransition,
  orderStatusLabel,
  orderStatusesThatHoldReservation,
} from "@/lib/orders/order-status"

export type TransitionOrderInput = {
  orderId: string
  toStatus: OrderStatus
  note?: string | null
  actorId: string | null
}

export type TransitionOrderResult = { ok: true } | { ok: false; error: string }

type OrderLine = {
  variantId: string | null
  quantity: number
  variant: { productId: string } | null
}

const sortedLines = (lines: OrderLine[]) =>
  [...lines].sort((a, b) => (a.variantId ?? "").localeCompare(b.variantId ?? ""))

export const transitionOrder = async (input: TransitionOrderInput): Promise<TransitionOrderResult> => {
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      status: true,
      items: {
        select: {
          variantId: true,
          quantity: true,
          variant: { select: { productId: true } },
        },
      },
    },
  })

  if (!order) return { ok: false, error: "Order not found." }

  const fromStatus = order.status
  if (!isAllowedOrderTransition(fromStatus, input.toStatus)) {
    return {
      ok: false,
      error: `Cannot move from ${orderStatusLabel(fromStatus)} to ${orderStatusLabel(input.toStatus)}.`,
    }
  }

  const noteTrimmed = input.note?.trim().slice(0, 500) || null
  const now = new Date()

  try {
    await db.$transaction(async (tx) => {
      for (const line of sortedLines(order.items)) {
        if (!line.variantId) {
          throw new Error("missing_variant")
        }
        const { variantId, quantity: qty } = line

        if (input.toStatus === "CANCELLED" && orderStatusesThatHoldReservation.includes(fromStatus)) {
          const ok = await releaseVariantReserve(tx, variantId, qty)
          if (!ok) throw new Error(`stock:release:${variantId}`)
        }

        if (input.toStatus === "DELIVERED") {
          const ok = await deliverVariantStock(tx, variantId, qty)
          if (!ok) throw new Error(`stock:deliver:${variantId}`)
        }

        if (input.toStatus === "RETURNED") {
          const ok = await restockVariant(tx, variantId, qty)
          if (!ok) throw new Error(`stock:return:${variantId}`)
        }
      }

      const timestampPatch: {
        confirmedAt?: Date
        shippedAt?: Date
        deliveredAt?: Date
        cancelledAt?: Date
      } = {}

      if (input.toStatus === "CONFIRMED") timestampPatch.confirmedAt = now
      if (input.toStatus === "SHIPPED") timestampPatch.shippedAt = now
      if (input.toStatus === "DELIVERED") timestampPatch.deliveredAt = now
      if (input.toStatus === "CANCELLED") timestampPatch.cancelledAt = now

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: input.toStatus,
          ...timestampPatch,
        },
      })

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus,
          toStatus: input.toStatus,
          note: noteTrimmed,
          changedById: input.actorId,
        },
      })

      const productIds = new Set<string>()
      for (const line of order.items) {
        if (line.variant?.productId) productIds.add(line.variant.productId)
      }
      for (const productId of [...productIds].sort()) {
        await syncProductInStock(tx, productId)
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "missing_variant") {
        return { ok: false, error: "A line item is missing its variant. Fix the order before changing status." }
      }
      if (error.message.startsWith("stock:")) {
        return { ok: false, error: "Stock could not be updated. Check inventory and try again." }
      }
    }
    throw error
  }

  return { ok: true }
}

export const markOrderPaid = async (orderId: string): Promise<TransitionOrderResult> => {
  const order = await db.order.findUnique({ where: { id: orderId }, select: { id: true, status: true, paymentStatus: true } })
  if (!order) return { ok: false, error: "Order not found." }
  if (order.status !== "DELIVERED") {
    return { ok: false, error: "Only delivered orders can be marked paid." }
  }
  if (order.paymentStatus === "PAID") return { ok: true }

  await db.order.update({ where: { id: orderId }, data: { paymentStatus: "PAID" } })
  return { ok: true }
}
