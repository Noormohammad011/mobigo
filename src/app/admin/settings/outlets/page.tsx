import Link from "next/link"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { buttonVariants } from "@/components/ui/button"
import { listAdminOutlets } from "@/lib/queries/admin-settings"
import { cn } from "@/lib/utils"

export const instant = false

const OutletsTable = async () => {
  const outlets = await listAdminOutlets()
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] text-body-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-semibold">Name</th>
            <th className="p-3 font-semibold">Address</th>
            <th className="p-3 font-semibold">Sort</th>
            <th className="p-3 font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {outlets.map((outlet) => (
            <tr key={outlet.id} className="border-b border-border last:border-0">
              <td className="p-3 font-medium text-foreground">{outlet.name}</td>
              <td className="p-3 text-muted-foreground">{outlet.address}</td>
              <td className="p-3">{outlet.sortOrder}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/settings/outlets/${outlet.id}`} className="text-link hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminOutletsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/settings" className="text-body-sm text-link hover:underline">
        ← Settings
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1 text-foreground">Outlets</h1>
        <Link href="/admin/settings/outlets/new" className={cn(buttonVariants({ variant: "default" }))}>
          New outlet
        </Link>
      </div>
      <Suspense fallback={<AdminPageFallback title="Outlets" />}>
        <OutletsTable />
      </Suspense>
    </div>
  )
}
