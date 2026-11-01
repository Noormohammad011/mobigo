import Link from "next/link"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import {
  ADMIN_ORDER_STATUSES,
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

      <form method="get" className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-body-sm">
            <span className="font-semibold text-foreground">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={typeof params.q === "string" ? params.q : ""}
              placeholder="Order number or phone"
              className="h-10 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-body-sm">
            <span className="font-semibold text-foreground">From date</span>
            <input
              type="date"
              name="from"
              defaultValue={typeof params.from === "string" ? params.from : ""}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-body-sm">
            <span className="font-semibold text-foreground">To date</span>
            <input
              type="date"
              name="to"
              defaultValue={typeof params.to === "string" ? params.to : ""}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
          </label>
        </div>
        <fieldset>
          <legend className="text-body-sm font-semibold text-foreground">Status</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {ADMIN_ORDER_STATUSES.map((status) => (
              <label key={status} className="flex items-center gap-2 text-body-sm">
                <input
                  type="checkbox"
                  name="status"
                  value={status}
                  defaultChecked={selectedStatus.includes(status)}
                  className="size-4"
                />
                {orderStatusLabel(status)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex gap-2">
          <button
            type="submit"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-body-sm font-semibold text-primary-foreground"
            )}
          >
            Apply filters
          </button>
          <Link href="/admin/orders" className="inline-flex h-10 items-center px-3 text-body-sm text-link hover:underline">
            Clear
          </Link>
        </div>
      </form>

      <Suspense fallback={<AdminPageFallback title="Orders" />}>
        <OrdersTable searchParams={params} />
      </Suspense>
    </div>
  )
}
