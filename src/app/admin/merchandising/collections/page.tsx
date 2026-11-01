import Link from "next/link"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { buttonVariants } from "@/components/ui/button"
import { listAdminCollections } from "@/lib/queries/admin-merchandising"
import { cn } from "@/lib/utils"

export const instant = false

const formatSchedule = (startsAt: Date | null, endsAt: Date | null) => {
  if (!startsAt && !endsAt) return "Always"
  const fmt = (d: Date) =>
    d.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Dhaka" })
  if (startsAt && endsAt) return `${fmt(startsAt)} → ${fmt(endsAt)}`
  if (startsAt) return `From ${fmt(startsAt)}`
  return `Until ${fmt(endsAt!)}`
}

const CollectionsTable = async () => {
  const collections = await listAdminCollections()
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[720px] text-body-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-semibold">Title</th>
            <th className="p-3 font-semibold">Slug</th>
            <th className="p-3 font-semibold">Home</th>
            <th className="p-3 font-semibold">Items</th>
            <th className="p-3 font-semibold">Sort</th>
            <th className="p-3 font-semibold">Schedule</th>
            <th className="p-3 font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => (
            <tr key={collection.id} className="border-b border-border last:border-0">
              <td className="p-3 font-medium text-foreground">{collection.title}</td>
              <td className="p-3 text-muted-foreground">{collection.slug}</td>
              <td className="p-3">{collection.showOnHome ? "Yes" : "No"}</td>
              <td className="p-3">{collection._count.items}</td>
              <td className="p-3">{collection.sortOrder}</td>
              <td className="p-3 text-muted-foreground">{formatSchedule(collection.startsAt, collection.endsAt)}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/merchandising/collections/${collection.id}`} className="text-link hover:underline">
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

export default function AdminCollectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1 text-foreground">Collections</h1>
        <Link href="/admin/merchandising/collections/new" className={cn(buttonVariants({ variant: "default" }))}>
          New collection
        </Link>
      </div>
      <Suspense fallback={<AdminPageFallback title="Collections" />}>
        <CollectionsTable />
      </Suspense>
    </div>
  )
}
