import Link from "next/link"
import { Suspense } from "react"

import { AdminOrdersFilterForm } from "@/components/admin/admin-orders-filter-form"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import {
  listAdminOrders,
  parseAdminOrderListFilters,
} from "@/lib/queries/admin-orders"
import { orderStatusLabel } from "@/lib/orders/order-status"
import { formatBDT } from "@/lib/format"
import { cn } from "@/lib/utils"

export const instant = false

const OrdersTable = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) => {
  const filters = parseAdminOrderListFilters(searchParams)
  const { rows, total, page, pageCount } = await listAdminOrders(filters)

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (typeof searchParams.q === "string" && searchParams.q) params.set("q", searchParams.q)
    if (typeof searchParams.from === "string" && searchParams.from) params.set("from", searchParams.from)
    if (typeof searchParams.to === "string" && searchParams.to) params.set("to", searchParams.to)
    const statusRaw = searchParams.status
    if (Array.isArray(statusRaw)) {
      statusRaw.forEach((s) => params.append("status", s))
    } else if (typeof statusRaw === "string" && statusRaw) {
      statusRaw.split(",").forEach((s) => params.append("status", s.trim()))
    }
    if (targetPage > 1) params.set("page", String(targetPage))
    const qs = params.toString()
    return qs ? `/admin/orders?${qs}` : "/admin/orders"
  }

  return (
    <>
      <p className="text-body-sm text-muted-foreground">
        {total} order{total === 1 ? "" : "s"}
        {filters.status?.length ? ` · filtered by status` : ""}
      </p>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[720px] text-body-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-semibold">Order</th>
              <th className="p-3 font-semibold">Customer</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Payment</th>
              <th className="p-3 font-semibold">Total</th>
              <th className="p-3 font-semibold">Placed</th>
              <th className="p-3 font-semibold"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="p-3 font-mono text-foreground">{order.orderNumber}</td>
                <td className="p-3">
                  <p className="font-medium text-foreground">{order.customerName}</p>
                  <p className="text-caption text-muted-foreground">{order.customerPhone}</p>
                </td>
                <td className="p-3">{orderStatusLabel(order.status)}</td>
                <td className="p-3">{order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}</td>
                <td className="p-3 font-price">{formatBDT(order.total)}</td>
                <td className="p-3 text-muted-foreground">{order.placedAt.toLocaleString("en-BD")}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-link hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 ? (
        <nav aria-label="Orders pagination" className="flex flex-wrap items-center gap-2">
          {page > 1 ? (
            <Link href={buildPageHref(page - 1)} className="text-link hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-body-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={buildPageHref(page + 1)} className="text-link hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  )
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const selectedStatus = Array.isArray(params.status)
    ? params.status
    : typeof params.status === "string"
      ? params.status.split(",").filter(Boolean)
      : []

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h1 text-foreground">Orders</h1>

      <AdminOrdersFilterForm
        defaultQuery={typeof params.q === "string" ? params.q : ""}
        defaultFrom={typeof params.from === "string" ? params.from : ""}
        defaultTo={typeof params.to === "string" ? params.to : ""}
        selectedStatus={selectedStatus}
      />

      <Suspense fallback={<AdminPageFallback title="Orders" />}>
        <OrdersTable searchParams={params} />
      </Suspense>
    </div>
  )
}
