"use client"

import Link from "next/link"
import { useMemo, useSyncExternalStore } from "react"

import { CheckoutForm } from "@/components/checkout/checkout-form"
import { buttonVariants } from "@/components/ui/button"
import {
  GUEST_CART_SERVER_SNAPSHOT,
  getGuestCartSnapshot,
  subscribeGuestCart,
} from "@/lib/cart/guest-cart"
import type { CheckoutLineInput } from "@/lib/orders/place-order"
import { cn } from "@/lib/utils"

type ZoneRow = { district: string; zoneName: string; fee: number }

export const CheckoutPageClient = ({
  signedIn,
  serverLines,
  serverSubtotal,
  zones,
  initialName,
  initialPhone,
  initialEmail,
}: {
  signedIn: boolean
  serverLines: CheckoutLineInput[]
  serverSubtotal: number
  zones: ZoneRow[]
  initialName: string
  initialPhone: string
  initialEmail: string
}) => {
  const guestCart = useSyncExternalStore(
    subscribeGuestCart,
    getGuestCartSnapshot,
    () => GUEST_CART_SERVER_SNAPSHOT
  )
  const guestLines = useMemo(
    () => guestCart.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
    [guestCart]
  )

  const lines = signedIn ? serverLines : guestLines
  const subtotal = signedIn ? serverSubtotal : guestCart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)

  if (lines.length === 0) {
    return (
      <div className="page-container flex flex-col gap-4 py-10">
        <h1 className="font-display text-h1 text-foreground">Checkout</h1>
        <p className="text-body text-muted-foreground">Your cart is empty.</p>
        <Link href="/phones" className={cn(buttonVariants({ variant: "default" }), "w-fit")}>
          Browse phones
        </Link>
      </div>
    )
  }

  const defaultFee = zones[0]?.fee ?? 0

  return (
    <div className="page-container grid max-w-2xl gap-6 py-6 lg:py-10">
      <h1 className="font-display text-h1 text-foreground">Checkout</h1>
      <CheckoutForm
        signedIn={signedIn}
        guestLines={guestLines}
        zones={zones}
        initialName={initialName}
        initialPhone={initialPhone}
        initialEmail={initialEmail}
        subtotal={subtotal}
        deliveryFee={defaultFee}
      />
    </div>
  )
}
