import { Suspense } from "react"
import type { Metadata } from "next"

import { TrackOrderForm } from "@/components/track/track-order-form"
import { assertFlag } from "@/lib/flags"

export const metadata: Metadata = {
  title: "Track order",
  description: "Track your MobiGo order with your order number and mobile.",
}

const TrackBody = async ({ searchParams }: { searchParams: Promise<{ order?: string }> }) => {
  await assertFlag("order_tracking")
  const { order } = await searchParams
  return (
    <>
      <h1 className="mb-2 font-display text-h1 text-foreground">Track order</h1>
      <p className="mb-6 text-body text-muted-foreground">Enter the order number and the mobile number you used at checkout.</p>
      <TrackOrderForm initialOrderNumber={order?.trim() ?? ""} />
    </>
  )
}

export default function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  return (
    <div className="page-container max-w-2xl py-8">
      <Suspense fallback={<div className="py-8 text-muted-foreground">Loading…</div>}>
        <TrackBody searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
