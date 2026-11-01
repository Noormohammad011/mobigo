import { Suspense } from "react"

import { NewProductForm } from "@/components/admin/new-product-form"
import { listBrandOptions } from "@/lib/queries/admin-catalog"

export const instant = false

const NewProductContent = async () => {
  const brands = await listBrandOptions()
  return <NewProductForm brands={brands} />
}

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h1 text-foreground">New product</h1>
      <Suspense fallback={<p className="text-body-sm text-muted-foreground">Loading form…</p>}>
        <NewProductContent />
      </Suspense>
    </div>
  )
}
