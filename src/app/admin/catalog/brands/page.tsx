import Link from "next/link"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { buttonVariants } from "@/components/ui/button"
import { listAdminBrands } from "@/lib/queries/admin-catalog"
import { cn } from "@/lib/utils"

export const instant = false

const BrandsTable = async () => {
  const brands = await listAdminBrands()
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] text-body-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-semibold">Name</th>
            <th className="p-3 font-semibold">Slug</th>
            <th className="p-3 font-semibold">Featured</th>
            <th className="p-3 font-semibold">Sort</th>
            <th className="p-3 font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id} className="border-b border-border last:border-0">
              <td className="p-3 font-medium text-foreground">{brand.name}</td>
              <td className="p-3 text-muted-foreground">{brand.slug}</td>
              <td className="p-3">{brand.isFeatured ? "Yes" : "No"}</td>
              <td className="p-3">{brand.sortOrder}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/catalog/brands/${brand.id}`} className="text-link hover:underline">
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

export default function AdminBrandsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1 text-foreground">Brands</h1>
        <Link href="/admin/catalog/brands/new" className={cn(buttonVariants({ variant: "default" }))}>
          New brand
        </Link>
      </div>
      <Suspense fallback={<AdminPageFallback title="Brands" />}>
        <BrandsTable />
      </Suspense>
    </div>
  )
}
