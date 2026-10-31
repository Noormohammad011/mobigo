import "server-only"

import { normalizeBdPhone } from "@/lib/auth/phone"
import { db } from "@/lib/db"
import {
  countPendingOrdersForPhone,
  getOrderMaxSubtotal,
  nextOrderNumber,
  reserveVariantStock,
  syncProductInStock,
} from "@/lib/orders/checkout-settings"
import { getVariantAvailability } from "@/lib/stock"
import { quantityAllowed } from "@/lib/stock-rule"

export type CheckoutLineInput = { variantId: string; quantity: number }

export type ResolvedCheckoutLine = {
  variantId: string
  quantity: number
  unitPrice: number
  lineTotal: number
  productId: string
  productName: string
  variantLabel: string
  sku: string
  imageUrl: string | null
}

export type PlaceOrderInput = {
  userId: string | null
  customerName: string
  customerPhone: string
  customerEmail: string | null
  division: string
  district: string
  area: string
  addressLine: string
  note: string | null
  deliveryZoneId: string
  lines: CheckoutLineInput[]
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; orderId: string }
  | { ok: false; code: "validation" | "lines" | "cap" | "pending_limit"; message: string; lineIssues?: { variantId: string; message: string }[] }

const PENDING_LIMIT = 3

export const resolveCheckoutLines = async (lines: CheckoutLineInput[]): Promise<
  | { ok: true; lines: ResolvedCheckoutLine[]; subtotal: number }
  | { ok: false; issues: { variantId: string; message: string }[] }
> => {
  if (lines.length === 0) return { ok: false, issues: [{ variantId: "", message: "Your cart is empty." }] }

  const ids = lines.map((l) => l.variantId)
  const availability = await getVariantAvailability(ids)
  const variants = await db.productVariant.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      price: true,
      sku: true,
      ramGb: true,
      storageGb: true,
      productId: true,
      product: { select: { name: true, status: true } },
      color: { select: { name: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } } },
    },
  })
  const byId = new Map(variants.map((v) => [v.id, v]))
  const issues: { variantId: string; message: string }[] = []
  const resolved: ResolvedCheckoutLine[] = []
  let subtotal = 0

  lines.forEach((line, index) => {
    const variant = byId.get(line.variantId)
    const avail = availability[index]
    if (!variant) {
      issues.push({ variantId: line.variantId, message: "This item is no longer available." })
      return
    }
    if (!avail || avail.reason !== "ok") {
      issues.push({ variantId: line.variantId, message: "Out of stock or not available for order." })
      return
    }
    const qty = Math.min(5, Math.max(1, Math.floor(line.quantity)))
    if (!quantityAllowed(avail.reason, avail.maxQuantity, qty)) {
      issues.push({ variantId: line.variantId, message: `Only ${avail.maxQuantity} available.` })
      return
    }
    const unitPrice = variant.price
    const lineTotal = unitPrice * qty
    const storage = variant.storageGb >= 1024 ? `${variant.storageGb / 1024}TB` : `${variant.storageGb}GB`
    resolved.push({
      variantId: variant.id,
      quantity: qty,
      unitPrice,
      lineTotal,
      productId: variant.productId,
      productName: variant.product.name,
      variantLabel: `${variant.color.name} · ${storage} / ${variant.ramGb}GB RAM`,
      sku: variant.sku,
      imageUrl: variant.color.images[0]?.url ?? null,
    })
    subtotal += lineTotal
  })

  if (issues.length > 0) return { ok: false, issues }
  return { ok: true, lines: resolved, subtotal }
}

export const placeOrder = async (input: PlaceOrderInput): Promise<PlaceOrderResult> => {
  const phone = normalizeBdPhone(input.customerPhone)
  if (!phone) return { ok: false, code: "validation", message: "Enter a valid mobile number (01XXXXXXXXX)." }

  const resolved = await resolveCheckoutLines(input.lines)
  if (!resolved.ok) {
    return { ok: false, code: "lines", message: "Some items in your cart changed.", lineIssues: resolved.issues }
  }

  const maxSubtotal = await getOrderMaxSubtotal()
  if (resolved.subtotal > maxSubtotal) {
    return {
      ok: false,
      code: "cap",
      message: `Orders over ${maxSubtotal.toLocaleString("en-BD")} BDT cannot be placed online. Call us to order.`,
    }
  }

  const pending = await countPendingOrdersForPhone(phone)
  if (pending >= PENDING_LIMIT) {
    return {
      ok: false,
      code: "pending_limit",
      message: "You already have 3 orders waiting for confirmation. Please wait or call support.",
    }
  }

  const zone = await db.deliveryZone.findUnique({ where: { id: input.deliveryZoneId }, select: { fee: true, isActive: true } })
  if (!zone?.isActive) return { ok: false, code: "validation", message: "Choose a valid delivery area." }

  const deliveryFee = zone.fee
  const total = resolved.subtotal + deliveryFee
  const orderNumber = await nextOrderNumber()

  try {
    const order = await db.$transaction(async (tx) => {
      for (const line of resolved.lines) {
        const ok = await reserveVariantStock(tx, line.variantId, line.quantity)
        if (!ok) {
          throw new Error(`stock:${line.variantId}`)
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: input.userId,
          status: "PENDING",
          customerName: input.customerName.trim().slice(0, 100),
          customerPhone: phone,
          customerEmail: input.customerEmail?.trim().toLowerCase() || null,
          division: input.division,
          district: input.district,
          area: input.area.trim().slice(0, 100),
          addressLine: input.addressLine.trim().slice(0, 300),
          note: input.note?.trim().slice(0, 500) || null,
          deliveryZoneId: input.deliveryZoneId,
          subtotal: resolved.subtotal,
          deliveryFee,
          discount: 0,
          total,
          items: {
            create: resolved.lines.map((line) => ({
              variantId: line.variantId,
              productName: line.productName,
              variantLabel: line.variantLabel,
              sku: line.sku,
              imageUrl: line.imageUrl,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              lineTotal: line.lineTotal,
            })),
          },
          statusHistory: {
            create: { fromStatus: null, toStatus: "PENDING", note: "Order placed" },
          },
        },
      })

      const productIds = [...new Set(resolved.lines.map((l) => l.productId))]
      for (const productId of productIds) {
        await syncProductInStock(tx, productId)
      }

      if (input.userId) {
        const cart = await tx.cart.findUnique({ where: { userId: input.userId } })
        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id, variantId: { in: resolved.lines.map((l) => l.variantId) } },
          })
        }
      }

      return created
    })

    return { ok: true, orderNumber: order.orderNumber, orderId: order.id }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("stock:")) {
      const variantId = error.message.slice(6)
      return {
        ok: false,
        code: "lines",
        message: "Stock changed while you were checking out.",
        lineIssues: [{ variantId, message: "No longer available in that quantity." }],
      }
    }
    throw error
  }
}

export const getCheckoutLinesForUser = async (userId: string): Promise<CheckoutLineInput[]> => {
  const cart = await db.cart.findUnique({
    where: { userId },
    select: { items: { select: { variantId: true, quantity: true } } },
  })
  return cart?.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })) ?? []
}
