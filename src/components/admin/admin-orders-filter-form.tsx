"use client"

import Link from "next/link"

import { DateInput } from "@/components/ui/date-input"
import { Input } from "@/components/ui/input"
import { ADMIN_ORDER_STATUSES } from "@/lib/queries/admin-orders"
import { orderStatusLabel } from "@/lib/orders/order-status"
import { cn } from "@/lib/utils"

export function AdminOrdersFilterForm({
  defaultQuery,
  defaultFrom,
  defaultTo,
  selectedStatus,
}: {
  defaultQuery: string
  defaultFrom: string
  defaultTo: string
  selectedStatus: string[]
}) {
  return (
    <form method="get" className="flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-body-sm font-semibold text-foreground">Search</span>
          <Input type="search" name="q" defaultValue={defaultQuery} placeholder="Order number or phone" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-body-sm font-semibold text-foreground">From date</span>
          <DateInput name="from" defaultValue={defaultFrom} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-body-sm font-semibold text-foreground">To date</span>
          <DateInput name="to" defaultValue={defaultTo} />
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
                className="size-4 rounded-sm border-border text-primary focus-visible:ring-3 focus-visible:ring-ring/40"
              />
              {orderStatusLabel(status)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-full bg-primary px-5 text-body-sm font-semibold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          )}
        >
          Apply filters
        </button>
        <Link
          href="/admin/orders"
          className="inline-flex h-12 items-center px-3 text-body-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          Clear
        </Link>
      </div>
    </form>
  )
}
