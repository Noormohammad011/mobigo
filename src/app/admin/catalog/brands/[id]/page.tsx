import { notFound } from "next/navigation"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { BrandForm } from "@/components/admin/brand-form"
import { getAdminBrand } from "@/lib/queries/admin-catalog"

export const instant = false

const EditBrandContent = async ({ id }: { id: string }) => {
  const brand = await getAdminBrand(id)
  if (!brand) notFound()
  return <BrandForm brand={brand} />
}

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-h1 text-foreground">Edit brand</h1>
      <Suspense fallback={<AdminPageFallback title="Edit brand" />}>
        <EditBrandParams params={params} />
      </Suspense>
    </div>
  )
}

const EditBrandParams = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return <EditBrandContent id={id} />
}
