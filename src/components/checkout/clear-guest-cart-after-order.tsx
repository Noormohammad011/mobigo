"use client"

import { useEffect } from "react"

import { clearGuestCart } from "@/lib/cart/guest-cart"

export const ClearGuestCartAfterOrder = () => {
  useEffect(() => {
    clearGuestCart()
  }, [])
  return null
}
