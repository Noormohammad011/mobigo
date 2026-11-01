import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { deleteOutletFormAction } from "@/app/admin/settings/actions"
import { OutletForm } from "@/components/admin/outlet-form"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { Button } from "@/components/ui/button"
import { getAdminOutlet } from "@/lib/queries/admin-settings"

export const instant = false

const OutletEdit = async ({ id, saved }: { id: string; saved?: boolean }) => {
  const outlet = await getAdminOutlet(id)
  if (!outlet) notFound()

  return (
    <div className="flex flex-col gap-8">
      {saved ? <p className="text-body-sm text-success-text">Outlet saved.</p> : null}
      <Link href="/admin/settings/outlets" className="text-body-sm text-link hover:underline">
        ← Outlets
      </Link>
      <h1 className="font-display text-h1 text-foreground">{outlet.name}</h1>
      <OutletForm outlet={outlet} />
      <form action={deleteOutletFormAction} className="max-w-lg rounded-lg border border-border bg-surface p-4">
        <input type="hidden" name="id" value={outlet.id} />
        <p className="text-body-sm text-muted-foreground">Remove this outlet from the storefront.</p>
        <Button type="submit" variant="destructive" className="mt-3">
          Delete outlet
        </Button>
      </form>
    </div>
  )
}

export default async function AdminOutletEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const { id } = await params
  const { saved } = await searchParams
  return (
    <Suspense fallback={<AdminPageFallback title="Outlet" />}>
      <OutletEdit id={id} saved={saved === "1"} />
    </Suspense>
  )
}
