import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { DeliveryZoneEditor } from "@/components/admin/delivery-zone-editor"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { getAdminDeliveryZone } from "@/lib/queries/admin-settings"

export const instant = false

const ZoneEdit = async ({ id, saved }: { id: string; saved?: boolean }) => {
  const zone = await getAdminDeliveryZone(id)
  if (!zone) notFound()

  return (
    <div className="flex flex-col gap-6">
      {saved ? <p className="text-body-sm text-success-text">Zone saved.</p> : null}
      <Link href="/admin/settings/delivery-zones" className="text-body-sm text-link hover:underline">
        ← Delivery zones
      </Link>
      <h1 className="font-display text-h1 text-foreground">{zone.name}</h1>
      <DeliveryZoneEditor zone={zone} />
    </div>
  )
}

export default async function AdminDeliveryZoneEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const { id } = await params
  const { saved } = await searchParams
  return (
    <Suspense fallback={<AdminPageFallback title="Delivery zone" />}>
      <ZoneEdit id={id} saved={saved === "1"} />
    </Suspense>
  )
}
