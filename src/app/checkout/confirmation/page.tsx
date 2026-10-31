import Link from "next/link"
import { Suspense } from "react"
import type { Metadata } from "next"

import { ClearGuestCartAfterOrder } from "@/components/checkout/clear-guest-cart-after-order"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
}

const ConfirmationBody = async ({ searchParams }: { searchParams: Promise<{ order?: string }> }) => {
  const { order } = await searchParams
  const orderNumber = order?.trim()

  return (
    <>
      <ClearGuestCartAfterOrder />
      <h1 className="font-display text-h1 text-foreground">Thank you</h1>
      {orderNumber ? (
        <>
          <p className="text-body text-muted-foreground">Your order number is</p>
          <p className="font-price text-h2 text-primary">{orderNumber}</p>
          <p className="text-body-sm text-muted-foreground">We will call you soon to confirm Cash on Delivery.</p>
        </>
      ) : (
        <p className="text-body text-muted-foreground">Your order was placed.</p>
      )}
      <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <Link href={`/track?order=${encodeURIComponent(orderNumber ?? "")}`} className={cn(buttonVariants({ variant: "outline" }))}>
          Track order
        </Link>
        <Link href="/phones" className={cn(buttonVariants({ variant: "default" }))}>
          Continue shopping
        </Link>
      </div>
    </>
  )
}

export default function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  return (
    <div className="page-container flex max-w-lg flex-col gap-4 py-10 text-center">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <ConfirmationBody searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
