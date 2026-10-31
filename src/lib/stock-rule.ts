/** Sellable quantity on one line. Same upper bound as the cart check (1 through 5). */
export const LINE_QUANTITY_CAP = 5

export const VARIANT_REASONS = [
  "ok",
  "preorder",
  "out_of_stock",
  "inactive",
  "draft",
  "discontinued",
  "missing",
] as const

export type VariantReason = (typeof VARIANT_REASONS)[number]

export type ProductReason = "ok" | "preorder" | "out_of_stock" | "draft" | "discontinued" | "missing"

export type ProductStatusName = "DRAFT" | "ACTIVE" | "PREORDER" | "DISCONTINUED"

export type VariantFacts = {
  status: ProductStatusName
  isActive: boolean
  stock: number
  reservedStock: number
}

export type VariantAvailability = {
  available: number
  reason: VariantReason
  maxQuantity: number
}

export type ProductFacts = {
  status: ProductStatusName
  variants: { stock: number; reservedStock: number; isActive: boolean }[]
}

export type ProductAvailability = {
  inStock: boolean
  reason: ProductReason
}

const unsellable = (reason: VariantReason): VariantAvailability => ({
  available: 0,
  reason,
  maxQuantity: 0,
})

/** Reason order: missing, then product status, then inactive, then the number. */
export const classifyVariant = (row: VariantFacts | null): VariantAvailability => {
  if (!row) return unsellable("missing")
  if (row.status === "PREORDER") return { available: 0, reason: "preorder", maxQuantity: LINE_QUANTITY_CAP }
  if (row.status === "DRAFT") return unsellable("draft")
  if (row.status === "DISCONTINUED") return unsellable("discontinued")
  if (!row.isActive) return unsellable("inactive")
  const raw = row.stock - row.reservedStock
  if (raw < 1) return unsellable("out_of_stock")
  return { available: raw, reason: "ok", maxQuantity: Math.min(LINE_QUANTITY_CAP, raw) }
}

/** A product row with no variants is out of stock. Missing is only for a missing id. */
export const classifyProduct = (row: ProductFacts | null): ProductAvailability => {
  if (!row) return { inStock: false, reason: "missing" }
  if (row.status === "PREORDER") return { inStock: false, reason: "preorder" }
  if (row.status === "DRAFT") return { inStock: false, reason: "draft" }
  if (row.status === "DISCONTINUED") return { inStock: false, reason: "discontinued" }
  const anySellable = row.variants.some((variant) => variant.isActive && variant.stock - variant.reservedStock >= 1)
  if (!anySellable) return { inStock: false, reason: "out_of_stock" }
  return { inStock: true, reason: "ok" }
}

/** True only for a whole number from 1 through maxQuantity when the reason is ok or preorder. */
export const quantityAllowed = (reason: VariantReason, maxQuantity: number, quantity: number): boolean => {
  if (reason !== "ok" && reason !== "preorder") return false
  if (!Number.isInteger(quantity)) return false
  return quantity >= 1 && quantity <= maxQuantity
}
