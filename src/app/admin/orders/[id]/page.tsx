import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { markOrderPaidFormAction } from "@/app/admin/orders/actions"
import { AdminOrderTransitionForm } from "@/components/admin/admin-order-transition-form"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { Price } from "@/components/commerce/price-block"
import { Button } from "@/components/ui/button"
import { getAdminOrder } from "@/lib/queries/admin-orders"
import { formatBDT } from "@/lib/format"
import { orderStatusLabel } from "@/lib/orders/order-status"

export const instant = false

const OrderDetail = async ({ id }: { id: string }) => {
  const order = await getAdminOrder(id)
  if (!order) notFound()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-body-sm text-link hover:underline">
            ← Orders
          </Link>
          <h1 className="font-display text-h1 text-foreground">{order.orderNumber}</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Placed {order.placedAt.toLocaleString("en-BD")} · {orderStatusLabel(order.status)} ·{" "}
            {order.paymentMethod} · {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="font-display text-h3 text-foreground">Customer</h2>
            <div className="mt-3 text-body-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              {order.customerEmail ? <p>{order.customerEmail}</p> : null}
              <p className="mt-2">
                {order.addressLine}, {order.area}, {order.district}, {order.division}
              </p>
              {order.note ? <p className="mt-2 italic">Note: {order.note}</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="font-display text-h3 text-foreground">Items</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 rounded-md border border-border bg-background p-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-white">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        width={64}
                        height={64}
                        unoptimized={item.imageUrl.endsWith(".svg")}
                        className="size-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{item.productName}</p>
                    <p className="text-body-sm text-muted-foreground">{item.variantLabel}</p>
                    <p className="text-body-sm text-muted-foreground">SKU {item.sku} · Qty {item.quantity}</p>
                    <Price price={item.unitPrice} className="mt-1" />
                  </div>
                  <p className="font-price shrink-0 text-body-sm font-semibold">{formatBDT(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-1 border-t border-border pt-4 text-body-sm">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-price">{formatBDT(order.subtotal)}</span>
              </p>
              <p className="flex justify-between">
                <span>Delivery ({order.deliveryZone.name})</span>
                <span className="font-price">{formatBDT(order.deliveryFee)}</span>
              </p>
              {order.discount > 0 ? (
                <p className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-price">−{formatBDT(order.discount)}</span>
                </p>
              ) : null}
              <p className="flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span className="font-price">{formatBDT(order.total)}</span>
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4">
            <h2 className="font-display text-h3 text-foreground">Status history</h2>
            <ol className="mt-3 flex flex-col gap-3 border-l border-border pl-4">
              {order.statusHistory.map((row) => (
                <li key={row.id} className="text-body-sm">
                  <p className="font-medium text-foreground">
                    {row.fromStatus ? `${orderStatusLabel(row.fromStatus)} → ` : ""}
                    {orderStatusLabel(row.toStatus)}
                  </p>
                  {row.note ? <p className="text-muted-foreground">{row.note}</p> : null}
                  <p className="text-caption text-muted-foreground">
                    {row.createdAt.toLocaleString("en-BD")}
                    {row.changedBy?.name ? ` · ${row.changedBy.name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <AdminOrderTransitionForm orderId={order.id} currentStatus={order.status} />
          {order.status === "DELIVERED" && order.paymentStatus !== "PAID" ? (
            <form action={markOrderPaidFormAction} className="rounded-lg border border-border bg-surface p-4">
              <input type="hidden" name="orderId" value={order.id} />
              <h2 className="font-display text-h3 text-foreground">COD remittance</h2>
              <p className="mt-2 text-body-sm text-muted-foreground">Mark payment received from the courier.</p>
              <Button type="submit" className="mt-3 w-full">
                Mark as paid
              </Button>
            </form>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<AdminPageFallback title="Order" />}>
      <OrderDetail id={id} />
    </Suspense>
  )
}
