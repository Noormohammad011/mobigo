import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { ProductEditForm } from "@/components/admin/product-edit-form"
import { toProductEditClientPayload } from "@/lib/admin/serialize-product-edit"
import { getAdminProductEdit, listBrandOptions } from "@/lib/queries/admin-catalog"

export const instant = false

const ProductEditContent = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) => {
  const { id } = await params
  const query = await searchParams
  const [{ product, specGroups }, brands] = await Promise.all([getAdminProductEdit(id), listBrandOptions()])
  if (!product) notFound()

  return (
    <>
      {query.saved === "1" ? (
        <p className="rounded-md bg-save-bg px-3 py-2 text-body-sm text-save-fg" role="status">
          Product saved. Storefront caches were refreshed.
        </p>
      ) : null}
      <ProductEditForm product={toProductEditClientPayload(product)} specGroups={specGroups} brands={brands} />
    </>
  )
}

export default function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-h1 text-foreground">Edit product</h1>
        <Link href="/admin/catalog/products" className="text-body-sm text-link hover:underline">
          Back to list
        </Link>
      </div>
      <Suspense fallback={<AdminPageFallback title="Edit product" />}>
        <ProductEditContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
