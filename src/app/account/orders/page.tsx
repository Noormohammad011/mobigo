import Link from "next/link"
import { Suspense } from "react"
import type { Metadata } from "next"

import { requireUser } from "@/lib/auth/session"
import { assertFlag } from "@/lib/flags"
import { db } from "@/lib/db"
import { formatBDT } from "@/lib/format"

export const metadata: Metadata = { title: "Order history", robots: { index: false, follow: false } }

const statusCopy: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
}

const OrdersList = async () => {
  await assertFlag("order_history")
  const user = await requireUser("/account/orders")

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { placedAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      placedAt: true,
      items: { take: 1, select: { productName: true } },
    },
  })

  return (
    <>
      {orders.length === 0 ? (
        <p className="text-body text-muted-foreground">You have not placed any orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground">{order.orderNumber}</span>
                  <span className="text-body-sm text-muted-foreground">{statusCopy[order.status] ?? order.status}</span>
                </div>
                <p className="text-body-sm text-muted-foreground line-clamp-1">
                  {order.items[0]?.productName}
                  {order.items.length > 1 ? " and more" : ""}
                </p>
                <p className="flex justify-between text-body-sm">
                  <time dateTime={order.placedAt.toISOString()}>{order.placedAt.toLocaleDateString("en-BD")}</time>
                  <span className="font-price font-semibold">{formatBDT(order.total)}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function AccountOrdersPage() {
  return (
    <div className="page-container max-w-2xl py-8">
      <h1 className="mb-2 font-display text-h1 text-foreground">Your orders</h1>
      <p className="mb-6 text-body-sm text-muted-foreground">
        <Link href="/account" className="text-link underline">
          Account
        </Link>
      </p>
      <Suspense fallback={<p className="text-muted-foreground">Loading orders…</p>}>
        <OrdersList />
      </Suspense>
    </div>
  )
}
