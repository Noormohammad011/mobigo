import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { Price } from "@/components/commerce/price-block"
import { requireUser } from "@/lib/auth/session"
import { assertFlag } from "@/lib/flags"
import { db } from "@/lib/db"
import { formatBDT } from "@/lib/format"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `Order ${id.slice(0, 8)}`, robots: { index: false, follow: false } }
}

const OrderDetail = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  await assertFlag("order_history")
  const user = await requireUser("/account/orders")

  const order = await db.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      deliveryZone: { select: { name: true } },
    },
  })
  if (!order) notFound()

  return (
    <>
      <h1 className="font-display text-h1 text-foreground">{order.orderNumber}</h1>
      <p className="mt-1 text-body-sm text-muted-foreground">Placed {order.placedAt.toLocaleString("en-BD")}</p>

      <section className="mt-6 grid gap-2 rounded-lg border border-border bg-card p-4">
        <h2 className="font-display text-h3 text-foreground">Status</h2>
        <ol className="flex flex-col gap-3 border-l border-border pl-4">
          {order.statusHistory.map((row) => (
            <li key={row.id} className="text-body-sm">
              <p className="font-medium text-foreground">{row.note ?? row.toStatus}</p>
              <time className="text-muted-foreground" dateTime={row.createdAt.toISOString()}>
                {row.createdAt.toLocaleString("en-BD")}
              </time>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 flex flex-col gap-3">
        <h2 className="font-display text-h3 text-foreground">Items</h2>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-white">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" width={64} height={64} unoptimized={item.imageUrl.endsWith(".svg")} className="size-full object-contain" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{item.productName}</p>
                <p className="text-body-sm text-muted-foreground">{item.variantLabel}</p>
                <p className="text-body-sm text-muted-foreground">Qty {item.quantity}</p>
                <Price price={item.unitPrice} className="mt-1" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-1 rounded-lg border border-border bg-card p-4 text-body-sm">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-price">{formatBDT(order.subtotal)}</span>
        </p>
        <p className="flex justify-between">
          <span>Delivery ({order.deliveryZone.name})</span>
          <span className="font-price">{formatBDT(order.deliveryFee)}</span>
        </p>
        <p className="flex justify-between font-semibold text-foreground">
          <span>Total</span>
          <span className="font-price">{formatBDT(order.total)}</span>
        </p>
      </section>

      <section className="mt-6 text-body-sm text-muted-foreground">
        <p>{order.customerName}</p>
        <p>{order.customerPhone}</p>
        <p>
          {order.addressLine}, {order.area}, {order.district}
        </p>
      </section>
    </>
  )
}

export default function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="page-container max-w-2xl py-8">
      <p className="mb-2 text-body-sm text-muted-foreground">
        <Link href="/account/orders" className="text-link underline">
          Orders
        </Link>
      </p>
      <Suspense fallback={<p className="text-muted-foreground">Loading order…</p>}>
        <OrderDetail params={params} />
      </Suspense>
    </div>
  )
}
