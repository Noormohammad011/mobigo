"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { AdminActionState } from "@/lib/admin/catalog-schemas"
import { requireAdminMerchandising } from "@/lib/admin/guard"
import {
  bannerFormSchema,
  collectionFormSchema,
  collectionItemsSchema,
} from "@/lib/admin/merchandising-schemas"
import { revalidateMerchandising } from "@/lib/admin/revalidate-merchandising"
import { uniqueCollectionSlug } from "@/lib/admin/unique-slug"
import { db } from "@/lib/db"

const parseJsonField = <T>(raw: FormDataEntryValue | null, label: string): T | AdminActionState => {
  if (typeof raw !== "string" || !raw.trim()) return { error: `Missing ${label}.` }
  try {
    return JSON.parse(raw) as T
  } catch {
    return { error: `Invalid ${label}.` }
  }
}

export const saveCollectionAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminMerchandising("/admin/merchandising/collections")
  const id = typeof formData.get("id") === "string" && formData.get("id") ? String(formData.get("id")) : undefined
  const title = String(formData.get("title") ?? "").trim()
  const slug = await uniqueCollectionSlug(title, id)

  const parsed = collectionFormSchema.safeParse({
    id,
    title,
    description: formData.get("description") ?? "",
    showOnHome: formData.get("showOnHome") === "on",
    sortOrder: formData.get("sortOrder") ?? 0,
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const description = parsed.data.description?.trim() ? parsed.data.description.trim() : null

  try {
    if (parsed.data.id) {
      await db.collection.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          slug,
          description,
          showOnHome: parsed.data.showOnHome,
          sortOrder: parsed.data.sortOrder,
          startsAt: parsed.data.startsAt,
          endsAt: parsed.data.endsAt,
        },
      })
      revalidateMerchandising()
      revalidatePath("/admin/merchandising/collections")
      revalidatePath(`/admin/merchandising/collections/${parsed.data.id}`)
      redirect(`/admin/merchandising/collections/${parsed.data.id}?saved=1`)
    }

    const created = await db.collection.create({
      data: {
        title: parsed.data.title,
        slug,
        description,
        showOnHome: parsed.data.showOnHome,
        sortOrder: parsed.data.sortOrder,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
      },
    })
    revalidateMerchandising()
    revalidatePath("/admin/merchandising/collections")
    redirect(`/admin/merchandising/collections/${created.id}`)
  } catch {
    return { error: "Could not save collection. Check the slug is unique." }
  }
}

export const saveCollectionItemsAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminMerchandising("/admin/merchandising/collections")
  const productIdsRaw = parseJsonField<unknown>(formData.get("productIdsJson"), "products")
  if ("error" in (productIdsRaw as object)) return productIdsRaw as AdminActionState

  const parsed = collectionItemsSchema.safeParse({
    collectionId: formData.get("collectionId"),
    productIds: productIdsRaw,
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const uniqueIds = [...new Set(parsed.data.productIds)]
  const collection = await db.collection.findUnique({
    where: { id: parsed.data.collectionId },
    select: { id: true },
  })
  if (!collection) return { error: "Collection not found." }

  try {
    await db.$transaction([
      db.collectionItem.deleteMany({ where: { collectionId: parsed.data.collectionId } }),
      ...(uniqueIds.length > 0
        ? [
            db.collectionItem.createMany({
              data: uniqueIds.map((productId, position) => ({
                collectionId: parsed.data.collectionId,
                productId,
                position,
              })),
            }),
          ]
        : []),
    ])
  } catch {
    return { error: "Could not save shelf products." }
  }

  revalidateMerchandising()
  revalidatePath(`/admin/merchandising/collections/${parsed.data.collectionId}`)
  return { ok: true }
}

export const deleteCollectionAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminMerchandising("/admin/merchandising/collections")
  const id = String(formData.get("id") ?? "")
  if (!z.string().cuid().safeParse(id).success) return { error: "Invalid collection." }

  try {
    await db.collection.delete({ where: { id } })
  } catch {
    return { error: "Could not delete collection." }
  }

  revalidateMerchandising()
  revalidatePath("/admin/merchandising/collections")
  redirect("/admin/merchandising/collections")
}

export const saveBannerAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminMerchandising("/admin/merchandising/banners")
  const id = typeof formData.get("id") === "string" && formData.get("id") ? String(formData.get("id")) : undefined

  const parsed = bannerFormSchema.safeParse({
    id,
    title: formData.get("title") ?? "",
    placement: formData.get("placement") ?? "HERO",
    imageMobileUrl: formData.get("imageMobileUrl") ?? "",
    imageDesktopUrl: formData.get("imageDesktopUrl") ?? "",
    alt: formData.get("alt") ?? "",
    linkUrl: formData.get("linkUrl") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") === "on",
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const linkUrl = parsed.data.linkUrl?.trim() ? parsed.data.linkUrl.trim() : null

  const data = {
    title: parsed.data.title,
    placement: parsed.data.placement,
    imageMobileUrl: parsed.data.imageMobileUrl.trim(),
    imageDesktopUrl: parsed.data.imageDesktopUrl.trim(),
    alt: parsed.data.alt,
    linkUrl,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
    startsAt: parsed.data.startsAt,
    endsAt: parsed.data.endsAt,
  }

  try {
    if (parsed.data.id) {
      await db.banner.update({ where: { id: parsed.data.id }, data })
    } else {
      await db.banner.create({ data })
    }
  } catch {
    return { error: "Could not save banner." }
  }

  revalidateMerchandising()
  revalidatePath("/admin/merchandising/banners")
  redirect("/admin/merchandising/banners?saved=1")
}

export const deleteCollectionFormAction = async (formData: FormData) => {
  await deleteCollectionAction(undefined, formData)
}

export const deleteBannerAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminMerchandising("/admin/merchandising/banners")
  const id = String(formData.get("id") ?? "")
  if (!z.string().cuid().safeParse(id).success) return { error: "Invalid banner." }

  try {
    await db.banner.delete({ where: { id } })
  } catch {
    return { error: "Could not delete banner." }
  }

  revalidateMerchandising()
  revalidatePath("/admin/merchandising/banners")
  redirect("/admin/merchandising/banners")
}

export const deleteBannerFormAction = async (formData: FormData) => {
  await deleteBannerAction(undefined, formData)
}
