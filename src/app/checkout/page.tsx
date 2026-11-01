import { Suspense } from "react"
import type { Metadata } from "next"

import { CheckoutPageClient } from "@/components/checkout/checkout-page-client"
import { PhoneListingFallback } from "@/components/listing/phone-listing-fallback"
import { getCurrentUser } from "@/lib/auth/session"
import { assertFlag } from "@/lib/flags"
import { db } from "@/lib/db"
import { getCheckoutLinesForUser, resolveCheckoutLines } from "@/lib/orders/place-order"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Cash on Delivery checkout for your MobiGo order.",
  robots: { index: false, follow: false },
}

const CheckoutBody = async () => {
  await assertFlag("cod_checkout")
  const user = await getCurrentUser()
  const serverLines = user ? await getCheckoutLinesForUser(user.id) : []
  let serverSubtotal = 0
  if (serverLines.length > 0) {
    const resolved = await resolveCheckoutLines(serverLines)
    if (resolved.ok) serverSubtotal = resolved.subtotal
  }

  const districts = await db.deliveryZoneDistrict.findMany({
    where: { zone: { isActive: true } },
    select: { district: true, zone: { select: { name: true, fee: true } } },
    orderBy: { district: "asc" },
  })
  const zones = districts.map((row) => ({
    district: row.district,
    zoneName: row.zone.name,
    fee: row.zone.fee,
  }))

  return (
    <CheckoutPageClient
      signedIn={Boolean(user)}
      serverLines={serverLines}
      serverSubtotal={serverSubtotal}
      zones={zones}
      initialName={user?.name ?? ""}
      initialPhone={user?.phone ?? ""}
      initialEmail={user?.email ?? ""}
    />
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PhoneListingFallback title="Checkout" intro="Loading checkout…" />}>
      <CheckoutBody />
    </Suspense>
  )
}
