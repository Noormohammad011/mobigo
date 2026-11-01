import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { deleteCollectionFormAction } from "@/app/admin/merchandising/actions"
import { CollectionForm } from "@/components/admin/collection-form"
import { CollectionItemsEditor } from "@/components/admin/collection-items-editor"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { Button } from "@/components/ui/button"
import { getAdminCollection } from "@/lib/queries/admin-merchandising"

export const instant = false

const CollectionEdit = async ({ id, saved }: { id: string; saved?: boolean }) => {
  const collection = await getAdminCollection(id)
  if (!collection) notFound()

  return (
    <div className="flex flex-col gap-8">
      {saved ? <p className="text-body-sm text-success-text">Collection saved.</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/merchandising/collections" className="text-body-sm text-link hover:underline">
            ← Collections
          </Link>
          <h1 className="font-display text-h1 text-foreground">{collection.title}</h1>
        </div>
        <Link
          href={`/collections/${collection.slug}`}
          className="text-body-sm text-link hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on storefront
        </Link>
      </div>
      <CollectionForm collection={collection} />
      <CollectionItemsEditor
        collectionId={collection.id}
        initialItems={collection.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          brandName: item.product.brandName,
          minPrice: item.product.minPrice,
        }))}
      />
      <form action={deleteCollectionFormAction} className="rounded-lg border border-border bg-surface p-4">
        <input type="hidden" name="id" value={collection.id} />
        <p className="text-body-sm text-muted-foreground">Delete this collection and all shelf items.</p>
        <Button type="submit" variant="destructive" className="mt-3">
          Delete collection
        </Button>
      </form>
    </div>
  )
}

export default async function AdminCollectionEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const { id } = await params
  const { saved } = await searchParams
  return (
    <Suspense fallback={<AdminPageFallback title="Collection" />}>
      <CollectionEdit id={id} saved={saved === "1"} />
    </Suspense>
  )
}
