import Link from "next/link"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { listAdminDeliveryZones } from "@/lib/queries/admin-settings"
import { formatBDT } from "@/lib/format"

export const instant = false

const ZonesTable = async () => {
  const zones = await listAdminDeliveryZones()
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] text-body-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-semibold">Zone</th>
            <th className="p-3 font-semibold">Fee</th>
            <th className="p-3 font-semibold">ETA (days)</th>
            <th className="p-3 font-semibold">Districts</th>
            <th className="p-3 font-semibold">Active</th>
            <th className="p-3 font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id} className="border-b border-border last:border-0">
              <td className="p-3 font-medium text-foreground">{zone.name}</td>
              <td className="p-3 font-price">{formatBDT(zone.fee)}</td>
              <td className="p-3">
                {zone.etaMinDays}–{zone.etaMaxDays}
              </td>
              <td className="p-3">{zone.districts.length}</td>
              <td className="p-3">{zone.isActive ? "Yes" : "No"}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/settings/delivery-zones/${zone.id}`} className="text-link hover:underline">
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

export default function AdminDeliveryZonesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/settings" className="text-body-sm text-link hover:underline">
        ← Settings
      </Link>
      <h1 className="font-display text-h1 text-foreground">Delivery zones</h1>
      <Suspense fallback={<AdminPageFallback title="Delivery zones" />}>
        <ZonesTable />
      </Suspense>
    </div>
  )
}
