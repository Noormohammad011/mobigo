"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  brandFormSchema,
  productFormSchema,
  type AdminActionState,
} from "@/lib/admin/catalog-schemas"
import { requireAdminCatalog } from "@/lib/admin/guard"
import { persistProduct } from "@/lib/admin/product-save"
import { revalidateProductCatalog } from "@/lib/admin/revalidate-catalog"
import { uniqueBrandSlug, uniqueProductSlug } from "@/lib/admin/unique-slug"
import { db } from "@/lib/db"
import { createStorageAdminClient, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/admin-storage"

const parseJsonField = <T>(raw: FormDataEntryValue | null, label: string): T | AdminActionState => {
  if (typeof raw !== "string" || !raw.trim()) return { error: `Missing ${label}.` }
  try {
    return JSON.parse(raw) as T
  } catch {
    return { error: `Invalid ${label}.` }
  }
}

export const saveBrandAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminCatalog("/admin/catalog/brands")
  const id = typeof formData.get("id") === "string" && formData.get("id") ? String(formData.get("id")) : undefined
  const name = String(formData.get("name") ?? "").trim()
  const slug = await uniqueBrandSlug(name, id)

  const parsed = brandFormSchema.safeParse({
    id,
    name,
    logoUrl: formData.get("logoUrl") ?? "",
    description: formData.get("description") ?? "",
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: formData.get("sortOrder") ?? 0,
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const logoUrl = parsed.data.logoUrl?.trim() ? parsed.data.logoUrl.trim() : null
  const description = parsed.data.description?.trim() ? parsed.data.description.trim() : null

  try {
    if (parsed.data.id) {
      await db.brand.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          slug,
          logoUrl,
          description,
          isFeatured: parsed.data.isFeatured,
          sortOrder: parsed.data.sortOrder,
        },
      })
      await db.product.updateMany({
        where: { brandId: parsed.data.id },
        data: { brandName: parsed.data.name },
      })
    } else {
      await db.brand.create({
        data: {
          name: parsed.data.name,
          slug,
          logoUrl,
          description,
          isFeatured: parsed.data.isFeatured,
          sortOrder: parsed.data.sortOrder,
        },
      })
    }
  } catch {
    return { error: "Could not save brand. Check the slug is unique." }
  }

  revalidateProductCatalog("")
  revalidatePath("/admin/catalog/brands")
  redirect("/admin/catalog/brands")
}

export const saveProductAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminCatalog("/admin/catalog/products")
  const colorsRaw = parseJsonField<unknown>(formData.get("colorsJson"), "colors")
  if ("error" in (colorsRaw as object)) return colorsRaw as AdminActionState
  const variantsRaw = parseJsonField<unknown>(formData.get("variantsJson"), "variants")
  if ("error" in (variantsRaw as object)) return variantsRaw as AdminActionState
  const specsRaw = parseJsonField<unknown>(formData.get("specValuesJson"), "spec values")
  if ("error" in (specsRaw as object)) return specsRaw as AdminActionState

  const networkRaw = formData.get("network")
  const productId =
    typeof formData.get("id") === "string" && formData.get("id") ? String(formData.get("id")) : undefined
  const name = String(formData.get("name") ?? "").trim()
  const previousSlug = productId
    ? (await db.product.findUnique({ where: { id: productId }, select: { slug: true } }))?.slug
    : undefined
  const slug = await uniqueProductSlug(name, productId)

  const parsed = productFormSchema.safeParse({
    id: productId,
    brandId: formData.get("brandId"),
    name,
    modelNumber: formData.get("modelNumber") ?? "",
    status: formData.get("status"),
    releaseDate: formData.get("releaseDate") ?? "",
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    metaTitle: formData.get("metaTitle") ?? "",
    metaDescription: formData.get("metaDescription") ?? "",
    network: networkRaw === "" || networkRaw == null ? null : networkRaw,
    displaySizeIn: formData.get("displaySizeIn") === "" ? null : formData.get("displaySizeIn"),
    batteryMah: formData.get("batteryMah") === "" ? null : formData.get("batteryMah"),
    chipsetBrand: formData.get("chipsetBrand") ?? "",
    colors: colorsRaw,
    variants: variantsRaw,
    specValues: specsRaw,
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const brand = await db.brand.findUnique({ where: { id: parsed.data.brandId }, select: { name: true } })
  if (!brand) return { error: "Brand not found." }

  let savedId: string
  try {
    const result = await persistProduct({ ...parsed.data, slug }, brand.name)
    savedId = result.productId
    revalidateProductCatalog(result.slug)
    if (previousSlug && previousSlug !== result.slug) {
      revalidateProductCatalog(previousSlug)
    }
    revalidatePath("/admin/catalog/products")
    revalidatePath(`/admin/catalog/products/${savedId}`)
  } catch (error) {
    console.error("[admin] save product failed", error)
    return { error: "Could not save product. Check SKU is unique and all required fields are filled." }
  }

  redirect(`/admin/catalog/products/${savedId}?saved=1`)
}

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])

export const uploadProductImageAction = async (formData: FormData): Promise<AdminActionState> => {
  await requireAdminCatalog("/admin/catalog/products")
  const productId = String(formData.get("productId") ?? "")
  const colorId = String(formData.get("colorId") ?? "")
  const file = formData.get("file")
  if (!productId || !colorId || !(file instanceof File)) return { error: "Missing upload fields." }
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be 5 MB or smaller." }
  const ext = ALLOWED_IMAGE_TYPES.get(file.type)
  if (!ext) return { error: "Use JPEG, PNG, or WebP." }

  const color = await db.productColor.findFirst({
    where: { id: colorId, productId },
    select: { id: true, product: { select: { slug: true, name: true } } },
  })
  if (!color) return { error: "Color not found for this product." }

  const admin = createStorageAdminClient()
  if (!admin) {
    return { error: "Image upload is not configured. Set SUPABASE_SERVICE_ROLE_KEY and create the product-images bucket." }
  }

  const path = `${productId}/${colorId}/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) return { error: uploadError.message }

  const { data: publicUrl } = admin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  const sortOrder = Number(formData.get("sortOrder") ?? 0)
  const alt = String(formData.get("alt") ?? `${color.product.name} product image`)

  await db.productImage.create({
    data: { colorId, url: publicUrl.publicUrl, alt, sortOrder },
  })

  revalidateProductCatalog(color.product.slug)
  revalidatePath(`/admin/catalog/products/${productId}`)
  return { ok: true }
}

export const deleteProductImageAction = async (formData: FormData): Promise<AdminActionState> => {
  await requireAdminCatalog("/admin/catalog/products")
  const imageId = String(formData.get("imageId") ?? "")
  const image = await db.productImage.findUnique({
    where: { id: imageId },
    select: { id: true, color: { select: { productId: true, product: { select: { slug: true } } } } },
  })
  if (!image) return { error: "Image not found." }
  await db.productImage.delete({ where: { id: imageId } })
  revalidateProductCatalog(image.color.product.slug)
  revalidatePath(`/admin/catalog/products/${image.color.productId}`)
  return { ok: true }
}

export const createDraftProductAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminCatalog("/admin/catalog/products/new")
  const brandId = String(formData.get("brandId") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  if (!brandId || !name) return { error: "Enter a brand and product name." }

  const brand = await db.brand.findUnique({ where: { id: brandId }, select: { name: true } })
  if (!brand) return { error: "Brand not found." }

  const slug = await uniqueProductSlug(name)

  let productId: string
  try {
    const product = await db.product.create({
      data: {
        brandId,
        brandName: brand.name,
        name,
        slug,
        status: "DRAFT",
        colors: {
          create: { name: "Default", hex: "#888888", sortOrder: 0 },
        },
      },
    })
    productId = product.id
  } catch (error) {
    console.error("[admin] create draft product failed", error)
    return { error: "Could not create product. Pick a brand and try again." }
  }

  redirect(`/admin/catalog/products/${productId}`)
}
