import Link from "next/link"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { buttonVariants } from "@/components/ui/button"
import { listAdminBanners } from "@/lib/queries/admin-merchandising"
import { cn } from "@/lib/utils"

export const instant = false

const placementLabel: Record<string, string> = {
  HERO: "Hero",
  HERO_SIDE: "Hero side",
  HOME_MID: "Home mid",
  PROMO_MODAL: "Promo modal",
}

const BannersTable = async () => {
  const banners = await listAdminBanners()
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[800px] text-body-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-semibold">Title</th>
            <th className="p-3 font-semibold">Placement</th>
            <th className="p-3 font-semibold">Active</th>
            <th className="p-3 font-semibold">Sort</th>
            <th className="p-3 font-semibold">Schedule</th>
            <th className="p-3 font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner.id} className="border-b border-border last:border-0">
              <td className="p-3 font-medium text-foreground">{banner.title}</td>
              <td className="p-3">{placementLabel[banner.placement] ?? banner.placement}</td>
              <td className="p-3">{banner.isActive ? "Yes" : "No"}</td>
              <td className="p-3">{banner.sortOrder}</td>
              <td className="p-3 text-muted-foreground">
                {banner.startsAt || banner.endsAt
                  ? `${banner.startsAt?.toLocaleDateString() ?? "…"} – ${banner.endsAt?.toLocaleDateString() ?? "…"}`
                  : "Always"}
              </td>
              <td className="p-3 text-right">
                <Link href={`/admin/merchandising/banners/${banner.id}`} className="text-link hover:underline">
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

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  const { saved } = await searchParams
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1 text-foreground">Banners</h1>
        <Link href="/admin/merchandising/banners/new" className={cn(buttonVariants({ variant: "default" }))}>
          New banner
        </Link>
      </div>
      {saved === "1" ? <p className="text-body-sm text-success-text">Banner saved.</p> : null}
      <Suspense fallback={<AdminPageFallback title="Banners" />}>
        <BannersTable />
      </Suspense>
    </div>
  )
}
