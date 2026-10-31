"use client"

import { useEffect, useState } from "react"

import { readGuestCart } from "@/lib/cart/guest-cart"

import { CartLink } from "./cart-link"

const guestUnitCount = () => readGuestCart().reduce((sum, line) => sum + line.quantity, 0)

export const CartLinkWithCount = ({ signedIn = false, serverCount = 0 }: { signedIn?: boolean; serverCount?: number }) => {
  const [guestCount, setGuestCount] = useState(0)

  useEffect(() => {
    if (signedIn) return undefined
    const refresh = () => setGuestCount(guestUnitCount())
    refresh()
    window.addEventListener("storage", refresh)
    window.addEventListener("mobigo-cart-updated", refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener("mobigo-cart-updated", refresh)
    }
  }, [signedIn])

  const count = signedIn ? serverCount : guestCount
  return <CartLink count={count} />
}
