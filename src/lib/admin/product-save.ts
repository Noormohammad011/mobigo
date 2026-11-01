import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import { denormalizedSpecColumns } from "@/lib/catalog/denormalize-product"
import { db } from "@/lib/db"
import { classifyProduct } from "@/lib/stock-rule"
import type { ProductFormInput } from "@/lib/admin/catalog-schemas"

export const recomputeDenormalizedProduct = (input: {
  status: ProductFormInput["status"]
  slug: string
  network: ProductFormInput["network"]
  variants: { price: number; compareAtPrice: number | null | undefined; stock: number; reservedStock: number; isActive: boolean; ramGb: number; storageGb: number }[]
}) => {
  const activeVariants = input.variants.filter((variant) => variant.isActive)
  const prices = activeVariants.map((variant) => variant.price)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const maxSaving = Math.max(
    0,
    ...activeVariants.map((variant) =>
      variant.compareAtPrice && variant.compareAtPrice > variant.price ? variant.compareAtPrice - variant.price : 0
    )
  )
  const ramOptionsGb = [...new Set(input.variants.map((variant) => variant.ramGb))].sort((a, b) => a - b)
  const storageOptionsGb = [...new Set(input.variants.map((variant) => variant.storageGb))].sort((a, b) => a - b)
  const specCols = denormalizedSpecColumns({ slug: input.slug, network: input.network ?? null })
  const inStock = classifyProduct({
    status: input.status,
    variants: input.variants.map((variant) => ({
      stock: variant.stock,
      reservedStock: variant.reservedStock,
      isActive: variant.isActive,
    })),
  }).inStock

  return {
    minPrice,
    maxPrice,
    maxSaving,
    ramOptionsGb,
    storageOptionsGb,
    inStock,
    mainCameraMp: specCols.mainCameraMp,
    refreshRateHz: specCols.refreshRateHz,
  }
}

export const persistProduct = async (parsed: ProductFormInput, brandName: string) => {
  const releaseDate = parsed.releaseDate?.trim()
    ? new Date(parsed.releaseDate)
    : null

  return db.$transaction(async (tx) => {
    const denormInput = {
      status: parsed.status,
      slug: parsed.slug,
      network: parsed.network,
      variants: parsed.variants.map((variant) => ({
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        stock: variant.stock,
        reservedStock: 0,
        isActive: variant.isActive,
        ramGb: variant.ramGb,
        storageGb: variant.storageGb,
      })),
    }

    const existingVariants =
      parsed.id != null
        ? await tx.productVariant.findMany({
            where: { productId: parsed.id },
            select: { id: true, reservedStock: true },
          })
        : []
    const reservedById = new Map(existingVariants.map((row) => [row.id, row.reservedStock]))

    denormInput.variants = parsed.variants.map((variant, index) => ({
      ...denormInput.variants[index],
      reservedStock: variant.id ? (reservedById.get(variant.id) ?? 0) : 0,
    }))

    const denorm = recomputeDenormalizedProduct(denormInput)

    const productData: Prisma.ProductUncheckedCreateInput = {
      brandId: parsed.brandId,
      brandName,
      name: parsed.name,
      slug: parsed.slug,
      modelNumber: parsed.modelNumber || null,
      shortDescription: parsed.shortDescription || null,
      description: parsed.description || null,
      status: parsed.status,
      releaseDate,
      metaTitle: parsed.metaTitle || null,
      metaDescription: parsed.metaDescription || null,
      network: parsed.network ?? null,
      displaySizeIn: parsed.displaySizeIn ?? null,
      batteryMah: parsed.batteryMah ?? null,
      chipsetBrand: parsed.chipsetBrand || null,
      ...denorm,
    }

    let productId = parsed.id
    if (productId) {
      await tx.product.update({ where: { id: productId }, data: productData })
    } else {
      const created = await tx.product.create({ data: productData })
      productId = created.id
    }

    const colorIdByIndex: string[] = []
    for (const color of parsed.colors) {
      if (color.id) {
        await tx.productColor.update({
          where: { id: color.id },
          data: { name: color.name, hex: color.hex, sortOrder: color.sortOrder },
        })
        colorIdByIndex.push(color.id)
      } else {
        const created = await tx.productColor.create({
          data: {
            productId,
            name: color.name,
            hex: color.hex,
            sortOrder: color.sortOrder,
          },
        })
        colorIdByIndex.push(created.id)
      }
    }

    if (parsed.id && colorIdByIndex.length > 0) {
      await tx.productColor.deleteMany({
        where: { productId, id: { notIn: colorIdByIndex } },
      })
    }

    const resolveColorId = (key: string) => {
      if (key.startsWith("idx:")) {
        const index = Number(key.slice(4))
        return colorIdByIndex[index] ?? key
      }
      return key
    }

    const submittedVariantIds = parsed.variants.map((variant) => variant.id).filter(Boolean) as string[]
    if (parsed.id) {
      await tx.productVariant.deleteMany({
        where: { productId, id: { notIn: submittedVariantIds.length ? submittedVariantIds : ["__none__"] } },
      })
    }

    for (const variant of parsed.variants) {
      const colorId = resolveColorId(variant.colorId)
      const data = {
        productId,
        colorId,
        ramGb: variant.ramGb,
        storageGb: variant.storageGb,
        sku: variant.sku,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice ?? null,
        stock: variant.stock,
        warrantyType: variant.warrantyType,
        isActive: variant.isActive,
      }
      if (variant.id) {
        await tx.productVariant.update({ where: { id: variant.id }, data })
      } else {
        await tx.productVariant.create({ data })
      }
    }

    for (const row of parsed.specValues) {
      if (!row.value) continue
      await tx.specValue.upsert({
        where: { productId_attributeId: { productId, attributeId: row.attributeId } },
        create: { productId, attributeId: row.attributeId, value: row.value },
        update: { value: row.value },
      })
    }

    return { productId, slug: parsed.slug }
  })
}
