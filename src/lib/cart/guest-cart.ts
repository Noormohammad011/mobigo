"use client"

export type GuestCartLine = {
  variantId: string
  quantity: number
  unitPrice: number
  productName?: string
  productSlug?: string
  variantLabel?: string
  imageUrl?: string | null
}

const KEY = "mobigo_guest_cart"

export const readGuestCart = (): GuestCartLine[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GuestCartLine[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const writeGuestCart = (lines: GuestCartLine[]) => {
  localStorage.setItem(KEY, JSON.stringify(lines))
}

export const addGuestLine = (line: GuestCartLine) => {
  const lines = readGuestCart()
  const existing = lines.find((entry) => entry.variantId === line.variantId)
  if (existing) {
    existing.quantity = Math.min(5, existing.quantity + line.quantity)
  } else {
    lines.push({ ...line, quantity: Math.min(5, line.quantity) })
  }
  writeGuestCart(lines)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mobigo-cart-updated"))
  }
}

export const clearGuestCart = () => {
  localStorage.removeItem(KEY)
}
