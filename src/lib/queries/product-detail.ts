import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { notFound } from "next/navigation"

import { db } from "@/lib/db"
import { productCardSelect, toProductCard, type ProductCardData } from "@/lib/queries/home"
import { getVariantAvailability } from "@/lib/stock"
import type { VariantAvailability } from "@/lib/stock-rule"

export type ProductDetailColor = {
  id: string
  name: string
  hex: string
  images: { url: string; alt: string }[]
}

export type ProductDetailVariant = {
  id: string
  colorId: string
  sku: string
  ramGb: number
  storageGb: number
  price: number
  compareAtPrice: number | null
}

export type ProductDetailCatalog = {
  id: string
  slug: string
  name: string
  brandName: string
  brandSlug: string
  status: "ACTIVE" | "PREORDER"
  description: string | null
  warrantyInfo: string | null
  colors: ProductDetailColor[]
  variants: ProductDetailVariant[]
  keySpecs: { label: string; value: string }[]
  related: ProductCardData[]
}

export type ProductDetailPayload = ProductDetailCatalog & {
  availability: Record<string, VariantAvailability>
}

const loadCatalogRow = async (slug: string): Promise<ProductDetailCatalog | null> => {
  const product = await db.product.findFirst({
    where: { slug, status: { in: ["ACTIVE", "PREORDER"] } },
    select: {
      id: true,
      slug: true,
      name: true,
      brandName: true,
      status: true,
      description: true,
      warrantyInfo: true,
      brand: { select: { slug: true } },
      colors: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          hex: true,
          images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
        },
      },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          colorId: true,
          sku: true,
          ramGb: true,
          storageGb: true,
          price: true,
          compareAtPrice: true,
        },
      },
      specs: {
        where: { attribute: { isKeySpec: true } },
        select: { value: true, attribute: { select: { name: true, sortOrder: true } } },
        orderBy: { attribute: { sortOrder: "asc" } },
      },
    },
  })
  if (!product) return null
  const relatedRows = await db.product.findMany({
    where: {
      brand: { slug: product.brand.slug },
      id: { not: product.id },
      status: { in: ["ACTIVE", "PREORDER"] },
    },
    take: 4,
    select: productCardSelect,
  })
  const now = Date.now()
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brandName,
    brandSlug: product.brand.slug,
    status: product.status as "ACTIVE" | "PREORDER",
    description: product.description,
    warrantyInfo: product.warrantyInfo,
    colors: product.colors,
    variants: product.variants,
    keySpecs: product.specs.map((row) => ({ label: row.attribute.name, value: row.value })),
    related: relatedRows.map((row) => toProductCard(row, now)),
  }
}

/** Catalog slice for PDP shell and metadata. Revalidates with the products cache tag. */
export const getProductDetailCatalog = async (slug: string): Promise<ProductDetailCatalog | null> => {
  "use cache"
  cacheTag("products")
  cacheTag(`product:${slug}`)
  cacheLife("minutes")
  return loadCatalogRow(slug)
}

const withAvailability = async (catalog: ProductDetailCatalog): Promise<ProductDetailPayload> => {
  const variantIds = catalog.variants.map((variant) => variant.id)
  const availabilityRows = await getVariantAvailability(variantIds)
  const availability = Object.fromEntries(variantIds.map((id, index) => [id, availabilityRows[index]]))
  return { ...catalog, availability }
}

/** Full PDP payload including live stock. Call inside Suspense, not from generateMetadata. */
export const getProductDetail = async (slug: string): Promise<ProductDetailPayload | null> => {
  const catalog = await getProductDetailCatalog(slug)
  if (!catalog) return null
  return withAvailability(catalog)
}

export const requireProductDetail = async (slug: string): Promise<ProductDetailPayload> => {
  const product = await getProductDetail(slug)
  if (!product) notFound()
  return product
}

export const requireProductDetailCatalog = async (slug: string): Promise<ProductDetailCatalog> => {
  const product = await getProductDetailCatalog(slug)
  if (!product) notFound()
  return product
}

/** Merge live stock onto an already loaded catalog row. */
export const attachProductAvailability = withAvailability
