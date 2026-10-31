import { Suspense } from "react"
import type { Metadata } from "next"

import { CartView } from "@/components/cart/cart-view"
import { PhoneListingFallback } from "@/components/listing/phone-listing-fallback"
import { getCurrentUser } from "@/lib/auth/session"
import { getCartLinesForUser } from "@/lib/cart/get-cart"
import { assertFlag } from "@/lib/flags"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the phones in your cart before checkout.",
}

const CartBody = async () => {
  const user = await getCurrentUser()
  const serverLines = user ? await getCartLinesForUser(user.id) : []
  return <CartView signedIn={Boolean(user)} serverLines={serverLines} />
}

const CartContent = async () => {
  await assertFlag("cart")
  return (
    <Suspense fallback={<PhoneListingFallback title="Your cart" intro="Loading your cart…" />}>
      <CartBody />
    </Suspense>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={<PhoneListingFallback title="Your cart" intro="Loading your cart…" />}>
      <CartContent />
    </Suspense>
  )
}
