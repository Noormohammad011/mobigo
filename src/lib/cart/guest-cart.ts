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
const EMPTY_CART: GuestCartLine[] = []

/** Stable empty snapshot for SSR and useSyncExternalStore getServer. */
export const GUEST_CART_SERVER_SNAPSHOT = EMPTY_CART

let guestCartSnapshot: GuestCartLine[] = EMPTY_CART
let guestCartKey = ""

export const readGuestCart = (): GuestCartLine[] => {
  if (typeof window === "undefined") return EMPTY_CART
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_CART
    const parsed = JSON.parse(raw) as GuestCartLine[]
    return Array.isArray(parsed) ? parsed : EMPTY_CART
  } catch {
    return EMPTY_CART
  }
}

/** Cached getSnapshot for useSyncExternalStore (must not return a new reference every call). */
export const getGuestCartSnapshot = (): GuestCartLine[] => {
  const next = readGuestCart()
  const key = JSON.stringify(next)
  if (key === guestCartKey) return guestCartSnapshot
  guestCartKey = key
  guestCartSnapshot = next
  return guestCartSnapshot
}

export const subscribeGuestCart = (onChange: () => void) => {
  window.addEventListener("mobigo-cart-updated", onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener("mobigo-cart-updated", onChange)
    window.removeEventListener("storage", onChange)
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
