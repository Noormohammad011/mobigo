import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductCard } from "@/components/commerce/product-card"
import { MetadataDynamicMarker } from "@/components/layout/metadata-dynamic-marker"
import { ProductPurchase } from "@/components/product/product-purchase"
import { RecentlyViewedRow, RecordRecentView } from "@/components/product/recently-viewed"
import { track } from "@/lib/analytics"
import { getCurrentUser } from "@/lib/auth/session"
import { assertFlag } from "@/lib/flags"
import { productMetadataForRoute, productStaticParams } from "@/lib/queries/route-metadata"
import {
  attachProductAvailability,
  getProductDetailCatalog,
  type ProductDetailCatalog,
  type ProductDetailPayload,
} from "@/lib/queries/product-detail"

type Search = Record<string, string | string[] | undefined>

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return productMetadataForRoute(params)
}

export async function generateStaticParams() {
  return productStaticParams()
}

const ProductJsonLd = ({
  product,
  variantId,
}: {
  product: ProductDetailPayload
  variantId: string | null
}) => {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobigo.example"
  const variant = variantId ? product.variants.find((entry) => entry.id === variantId) : product.variants[0]
  if (!variant) return null
  const availability = product.availability[variant.id]
  const inStock = availability?.reason === "ok" || availability?.reason === "preorder"
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brandName },
    sku: variant.sku,
    offers: {
      "@type": "Offer",
      url: `${site}/phones/${product.slug}?variant=${variant.id}`,
      priceCurrency: "BDT",
      price: variant.price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

const ProductDetailPurchase = async ({
  catalog,
  searchParams,
}: {
  catalog: ProductDetailCatalog
  searchParams: Promise<Search>
}) => {
  const [product, user, resolvedSearch] = await Promise.all([
    attachProductAvailability(catalog),
    getCurrentUser(),
    searchParams,
  ])
  const variantParam = typeof resolvedSearch.variant === "string" ? resolvedSearch.variant : null
  const heroImage = catalog.colors[0]?.images[0]?.url ?? null

  return (
    <>
      <ProductJsonLd product={product} variantId={variantParam} />
      <RecordRecentView item={{ slug: catalog.slug, name: catalog.name, brandName: catalog.brandName, imageUrl: heroImage }} />
      <ProductPurchase product={product} signedIn={Boolean(user)} />
    </>
  )
}

const ProductDetailContent = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}) => {
  await assertFlag("product_detail")
  const { slug } = await params
  const catalog = await getProductDetailCatalog(slug)
  if (!catalog) notFound()
  track({ name: "product_view", productId: catalog.id, slug: catalog.slug })

  return (
    <div className="page-container flex flex-col gap-10 py-6 lg:py-10">
      <Suspense fallback={<div className="min-h-[480px] animate-pulse rounded-lg bg-skeleton" aria-hidden="true" />}>
        <ProductDetailPurchase catalog={catalog} searchParams={searchParams} />
      </Suspense>

      {catalog.keySpecs.length > 0 ? (
        <section className="flex flex-col gap-4 border-t border-border pt-10" aria-labelledby="key-specs-heading">
          <h2 id="key-specs-heading" className="font-display text-h2 text-foreground">
            Key specs
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {catalog.keySpecs.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 border-b border-border pb-2 text-body-sm">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {catalog.description ? (
        <section className="flex flex-col gap-3 border-t border-border pt-10" aria-labelledby="about-heading">
          <h2 id="about-heading" className="font-display text-h2 text-foreground">
            About this phone
          </h2>
          <div className="prose prose-sm max-w-none text-body text-muted-foreground" dangerouslySetInnerHTML={{ __html: catalog.description }} />
        </section>
      ) : null}

      {catalog.warrantyInfo ? (
        <p className="text-body-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Warranty: </span>
          {catalog.warrantyInfo}
        </p>
      ) : null}

      {catalog.related.length > 0 ? (
        <section className="flex flex-col gap-4 border-t border-border pt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-display text-h2 text-foreground">
            More from {catalog.brandName}
          </h2>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {catalog.related.map((related) => (
              <li key={related.id}>
                <ProductCard product={related} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RecentlyViewedRow currentSlug={catalog.slug} />
    </div>
  )
}

export default function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}) {
  return (
    <>
      <Suspense fallback={<div className="page-container py-10 text-body text-muted-foreground">Loading phone…</div>}>
        <ProductDetailContent params={params} searchParams={searchParams} />
      </Suspense>
      <MetadataDynamicMarker />
    </>
  )
}
