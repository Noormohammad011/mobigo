import { describe, expect, it } from "vitest"

import { db } from "@/lib/db"
import { placeOrder } from "@/lib/orders/place-order"
import { allowedNextStatuses } from "@/lib/orders/order-status"
import { transitionOrder } from "@/lib/orders/transition-order"

const suffix = () => Math.random().toString(36).slice(2, 8)

const seedOrder = async () => {
  const tag = suffix()
  const brand = await db.brand.create({ data: { name: `T ${tag}`, slug: `t-${tag}` } })
  const product = await db.product.create({
    data: {
      brandId: brand.id,
      brandName: brand.name,
      name: `Phone ${tag}`,
      slug: `phone-${tag}`,
      status: "ACTIVE",
      minPrice: 10000,
      maxPrice: 10000,
      inStock: true,
      network: "G5",
      displaySizeIn: 6.6,
      batteryMah: 5000,
      chipsetBrand: "Test",
      ramOptionsGb: [8],
      storageOptionsGb: [128],
    },
  })
  const color = await db.productColor.create({ data: { productId: product.id, name: "Black", hex: "#000" } })
  const variant = await db.productVariant.create({
    data: {
      productId: product.id,
      colorId: color.id,
      sku: `SKU-${tag}`,
      ramGb: 8,
      storageGb: 128,
      price: 10000,
      stock: 5,
      reservedStock: 0,
      isActive: true,
      warrantyType: "OFFICIAL",
    },
  })
  let zone = await db.deliveryZone.findFirst({ where: { name: "Inside Dhaka" } })
  if (!zone) {
    zone = await db.deliveryZone.create({ data: { name: "Inside Dhaka", fee: 60, etaMinDays: 1, etaMaxDays: 2 } })
  }
  const phone = `017${Math.floor(10000000 + Math.random() * 89999999)}`
  const placed = await placeOrder({
    userId: null,
    customerName: "Test",
    customerPhone: phone,
    customerEmail: null,
    division: "Dhaka",
    district: "Dhaka",
    area: "Dhanmondi",
    addressLine: "Road 1",
    note: null,
    deliveryZoneId: zone.id,
    lines: [{ variantId: variant.id, quantity: 2 }],
  })
  if (!placed.ok) throw new Error("place failed")
  return { orderId: placed.orderId, variantId: variant.id, productId: product.id }
}

describe("transitionOrder", () => {
  it("rejects illegal transitions", async () => {
    const { orderId } = await seedOrder()
    const bad = await transitionOrder({ orderId, toStatus: "DELIVERED", note: null, actorId: null })
    expect(bad.ok).toBe(false)
  })

  it("cancel from pending releases reserved stock", async () => {
    const { orderId, variantId } = await seedOrder()
    const before = await db.productVariant.findUnique({ where: { id: variantId } })
    expect(before?.reservedStock).toBe(2)

    const result = await transitionOrder({ orderId, toStatus: "CANCELLED", note: "Customer asked", actorId: null })
    expect(result.ok).toBe(true)

    const after = await db.productVariant.findUnique({ where: { id: variantId } })
    expect(after?.reservedStock).toBe(0)
    expect(after?.stock).toBe(5)

    const order = await db.order.findUnique({ where: { id: orderId } })
    expect(order?.status).toBe("CANCELLED")
    expect(order?.cancelledAt).toBeTruthy()
  })

  it("deliver from shipped consumes stock and reservation", async () => {
    const { orderId, variantId } = await seedOrder()
    for (const status of ["CONFIRMED", "SHIPPED"] as const) {
      const step = await transitionOrder({ orderId, toStatus: status, note: null, actorId: null })
      expect(step.ok).toBe(true)
    }

    const mid = await db.productVariant.findUnique({ where: { id: variantId } })
    expect(mid?.reservedStock).toBe(2)
    expect(mid?.stock).toBe(5)

    const delivered = await transitionOrder({ orderId, toStatus: "DELIVERED", note: null, actorId: null })
    expect(delivered.ok).toBe(true)

    const after = await db.productVariant.findUnique({ where: { id: variantId } })
    expect(after?.stock).toBe(3)
    expect(after?.reservedStock).toBe(0)
  })

  it("return from delivered restocks", async () => {
    const { orderId, variantId } = await seedOrder()
    for (const status of ["CONFIRMED", "SHIPPED", "DELIVERED"] as const) {
      const step = await transitionOrder({ orderId, toStatus: status, note: null, actorId: null })
      expect(step.ok).toBe(true)
    }

    const sold = await db.productVariant.findUnique({ where: { id: variantId } })
    expect(sold?.stock).toBe(3)

    const returned = await transitionOrder({ orderId, toStatus: "RETURNED", note: "Defective", actorId: null })
    expect(returned.ok).toBe(true)

    const after = await db.productVariant.findUnique({ where: { id: variantId } })
    expect(after?.stock).toBe(5)
    expect(allowedNextStatuses("DELIVERED")).toEqual(["RETURNED"])
  })
})
