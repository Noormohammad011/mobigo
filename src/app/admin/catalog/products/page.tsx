import Link from "next/link"
import { Suspense } from "react"

import { AdminProductsFilterForm } from "@/components/admin/admin-products-filter-form"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { buttonVariants } from "@/components/ui/button"
import { formatBDT } from "@/lib/format"
import { listAdminProducts, listBrandOptions } from "@/lib/queries/admin-catalog"
import { cn } from "@/lib/utils"
import type { ProductStatus } from "@/generated/prisma/client"

const STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "PREORDER", "DISCONTINUED"]

export const instant = false

type Search = { q?: string; brandId?: string; status?: string; page?: string }

const AdminProductsContent = async ({ searchParams }: { searchParams: Promise<Search> }) => {
  const params = await searchParams
  const page = Number(params.page ?? "1")
  const status = STATUSES.includes(params.status as ProductStatus) ? (params.status as ProductStatus) : undefined
  const [{ items, total, pageCount }, brands] = await Promise.all([
    listAdminProducts({ q: params.q, brandId: params.brandId, status, page }),
    listBrandOptions(),
  ])

  return (
    <>
      <AdminProductsFilterForm
        defaultQuery={params.q ?? ""}
        defaultBrandId={params.brandId ?? ""}
        defaultStatus={params.status ?? ""}
        brands={brands}
      />

      <p className="text-body-sm text-muted-foreground">{total} products</p>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[720px] text-body-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Brand</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">From</th>
              <th className="p-3 font-semibold">Stock</th>
              <th className="p-3 font-semibold"> </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-caption text-muted-foreground">{item.slug}</p>
                </td>
                <td className="p-3">{item.brand.name}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3 font-price">{formatBDT(item.minPrice)}</td>
                <td className="p-3">{item.inStock ? "In stock" : "No"}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/catalog/products/${item.id}`} className="text-link hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex flex-wrap gap-2">
          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1
            const query = new URLSearchParams()
            if (params.q) query.set("q", params.q)
            if (params.brandId) query.set("brandId", params.brandId)
            if (params.status) query.set("status", params.status)
            query.set("page", String(pageNumber))
            return (
              <Link
                key={pageNumber}
                href={`/admin/catalog/products?${query.toString()}`}
                className={cn(
                  "inline-flex min-w-10 items-center justify-center rounded-md border px-2 py-1 text-body-sm",
                  pageNumber === page ? "border-primary bg-primary text-primary-foreground" : "border-border"
                )}
              >
                {pageNumber}
              </Link>
            )
          })}
        </nav>
      ) : null}
    </>
  )
}

export default function AdminProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1 text-foreground">Products</h1>
        <Link href="/admin/catalog/products/new" className={cn(buttonVariants({ variant: "default" }))}>
          New product
        </Link>
      </div>
      <Suspense fallback={<AdminPageFallback title="Products" />}>
        <AdminProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
