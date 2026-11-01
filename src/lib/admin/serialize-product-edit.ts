import type { getAdminProductEdit } from "@/lib/queries/admin-catalog"

type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProductEdit>>["product"]>

export type ProductEditClientPayload = {
  id: string
  brandId: string
  name: string
  slug: string
  modelNumber: string | null
  status: AdminProduct["status"]
  releaseDate: string | null
  shortDescription: string | null
  description: string | null
  metaTitle: string | null
  metaDescription: string | null
  network: AdminProduct["network"]
  displaySizeIn: number | null
  batteryMah: number | null
  chipsetBrand: string | null
  colors: {
    id: string
    name: string
    hex: string
    sortOrder: number
    images: { id: string; url: string; alt: string; sortOrder: number }[]
  }[]
  variants: {
    id: string
    colorId: string
    ramGb: number
    storageGb: number
    sku: string
    price: number
    compareAtPrice: number | null
    stock: number
    reservedStock: number
    warrantyType: AdminProduct["variants"][number]["warrantyType"]
    isActive: boolean
  }[]
  specs: { attributeId: string; value: string }[]
}

export const toProductEditClientPayload = (product: AdminProduct): ProductEditClientPayload => ({
  id: product.id,
  brandId: product.brandId,
  name: product.name,
  slug: product.slug,
  modelNumber: product.modelNumber,
  status: product.status,
  releaseDate: product.releaseDate ? product.releaseDate.toISOString().slice(0, 10) : null,
  shortDescription: product.shortDescription,
  description: product.description,
  metaTitle: product.metaTitle,
  metaDescription: product.metaDescription,
  network: product.network,
  displaySizeIn: product.displaySizeIn != null ? Number(product.displaySizeIn) : null,
  batteryMah: product.batteryMah,
  chipsetBrand: product.chipsetBrand,
  colors: product.colors.map((color) => ({
    id: color.id,
    name: color.name,
    hex: color.hex,
    sortOrder: color.sortOrder,
    images: color.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    })),
  })),
  variants: product.variants.map((variant) => ({
    id: variant.id,
    colorId: variant.colorId,
    ramGb: variant.ramGb,
    storageGb: variant.storageGb,
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
    reservedStock: variant.reservedStock,
    warrantyType: variant.warrantyType,
    isActive: variant.isActive,
  })),
  specs: product.specs.map((row) => ({ attributeId: row.attributeId, value: row.value })),
})
