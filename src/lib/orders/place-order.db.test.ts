import { describe, expect, it } from "vitest"

import { db } from "@/lib/db"
import { getOrderMaxSubtotal } from "@/lib/orders/checkout-settings"
import { placeOrder, resolveCheckoutLines } from "@/lib/orders/place-order"

const suffix = () => Math.random().toString(36).slice(2, 8)

const seedCheckoutFixture = async () => {
  const tag = suffix()
  const brand = await db.brand.create({
    data: { name: `Test ${tag}`, slug: `test-${tag}`, isFeatured: false },
  })
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
  const color = await db.productColor.create({
    data: { productId: product.id, name: "Black", hex: "#000000", sortOrder: 0 },
  })
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
    zone = await db.deliveryZone.create({
      data: { name: "Inside Dhaka", fee: 60, etaMinDays: 1, etaMaxDays: 2 },
    })
  }
  await db.deliveryZoneDistrict.upsert({
    where: { district: "Dhaka" },
    update: { zoneId: zone.id },
    create: { district: "Dhaka", zoneId: zone.id },
  })
  return { variant, zone, phone: `017${Math.floor(10000000 + Math.random() * 89999999)}` }
}

describe("resolveCheckoutLines", () => {
  it("rejects preorder products", async () => {
    const tag = suffix()
    const brand = await db.brand.create({ data: { name: `P ${tag}`, slug: `p-${tag}` } })
    const product = await db.product.create({
      data: {
        brandId: brand.id,
        brandName: brand.name,
        name: "Pre",
        slug: `pre-${tag}`,
        status: "PREORDER",
        minPrice: 5000,
        maxPrice: 5000,
        inStock: false,
        network: "G5",
        ramOptionsGb: [8],
        storageOptionsGb: [128],
      },
    })
    const color = await db.productColor.create({
      data: { productId: product.id, name: "Blue", hex: "#0000ff" },
    })
    const variant = await db.productVariant.create({
      data: {
        productId: product.id,
        colorId: color.id,
        sku: `PRE-${tag}`,
        ramGb: 8,
        storageGb: 128,
        price: 5000,
        stock: 10,
        reservedStock: 0,
        isActive: true,
        warrantyType: "OFFICIAL",
      },
    })
    const result = await resolveCheckoutLines([{ variantId: variant.id, quantity: 1 }])
    expect(result.ok).toBe(false)
  })
})

describe("placeOrder", () => {
  it("creates a pending order and reserves stock", async () => {
    const { variant, zone, phone } = await seedCheckoutFixture()
    const result = await placeOrder({
      userId: null,
      customerName: "Test User",
      customerPhone: phone,
      customerEmail: null,
      division: "Dhaka",
      district: "Dhaka",
      area: "Dhanmondi",
      addressLine: "Road 1",
      note: null,
      deliveryZoneId: zone.id,
      lines: [{ variantId: variant.id, quantity: 1 }],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.orderNumber).toMatch(/^MG-/)
    const updated = await db.productVariant.findUnique({ where: { id: variant.id } })
    expect(updated?.reservedStock).toBe(1)
  })

  it("blocks a fourth pending order for the same phone", async () => {
    const { variant, zone, phone } = await seedCheckoutFixture()
    for (let i = 0; i < 3; i++) {
      const ok = await placeOrder({
        userId: null,
        customerName: "Test User",
        customerPhone: phone,
        customerEmail: null,
        division: "Dhaka",
        district: "Dhaka",
        area: "Dhanmondi",
        addressLine: "Road 1",
        note: null,
        deliveryZoneId: zone.id,
        lines: [{ variantId: variant.id, quantity: 1 }],
      })
      expect(ok.ok).toBe(true)
    }
    const blocked = await placeOrder({
      userId: null,
      customerName: "Test User",
      customerPhone: phone,
      customerEmail: null,
      division: "Dhaka",
      district: "Dhaka",
      area: "Dhanmondi",
      addressLine: "Road 1",
      note: null,
      deliveryZoneId: zone.id,
      lines: [{ variantId: variant.id, quantity: 1 }],
    })
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.code).toBe("pending_limit")
  })

  it("refuses orders over the subtotal cap", async () => {
    const { variant, zone, phone } = await seedCheckoutFixture()
    await db.setting.upsert({
      where: { key: "order_max_subtotal" },
      create: { key: "order_max_subtotal", value: 5000 },
      update: { value: 5000 },
    })
    const cap = await getOrderMaxSubtotal()
    expect(cap).toBe(5000)
    const result = await placeOrder({
      userId: null,
      customerName: "Test User",
      customerPhone: phone,
      customerEmail: null,
      division: "Dhaka",
      district: "Dhaka",
      area: "Dhanmondi",
      addressLine: "Road 1",
      note: null,
      deliveryZoneId: zone.id,
      lines: [{ variantId: variant.id, quantity: 1 }],
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe("cap")
  })
})
