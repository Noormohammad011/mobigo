"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { AdminActionState } from "@/lib/admin/catalog-schemas"
import { requireAdminSettings } from "@/lib/admin/guard"
import { revalidateCmsPage, revalidateStoreSettings } from "@/lib/admin/revalidate-settings"
import {
  contactSettingsSchema,
  outletFormSchema,
  pageFormSchema,
  zoneDistrictSchema,
  zoneFormSchema,
} from "@/lib/admin/settings-schemas"
import { db } from "@/lib/db"

const upsertSetting = async (key: string, value: string | number | boolean) => {
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })
}

export const saveContactSettingsAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminSettings("/admin/settings/contact")
  const parsed = contactSettingsSchema.safeParse({
    support_phone: formData.get("support_phone") ?? "",
    support_email: formData.get("support_email") ?? "",
    whatsapp_number: formData.get("whatsapp_number") ?? "",
    facebook_url: formData.get("facebook_url") ?? "",
    youtube_url: formData.get("youtube_url") ?? "",
    order_max_subtotal: formData.get("order_max_subtotal") ?? 300000,
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  try {
    await upsertSetting("support_phone", parsed.data.support_phone?.trim() ?? "")
    await upsertSetting("support_email", parsed.data.support_email?.trim() ?? "")
    await upsertSetting("whatsapp_number", parsed.data.whatsapp_number?.trim() ?? "")
    await upsertSetting("facebook_url", parsed.data.facebook_url?.trim() ?? "")
    await upsertSetting("youtube_url", parsed.data.youtube_url?.trim() ?? "")
    await upsertSetting("order_max_subtotal", parsed.data.order_max_subtotal)
  } catch {
    return { error: "Could not save settings." }
  }

  revalidateStoreSettings()
  revalidatePath("/admin/settings/contact")
  return { ok: true }
}

export const savePageAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminSettings("/admin/settings/pages")
  const parsed = pageFormSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title") ?? "",
    content: formData.get("content") ?? "",
    metaDescription: formData.get("metaDescription") ?? "",
    isPublished: formData.get("isPublished") === "on",
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const meta = parsed.data.metaDescription?.trim() ? parsed.data.metaDescription.trim() : null

  try {
    const page = await db.page.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        metaDescription: meta,
        isPublished: parsed.data.isPublished,
      },
      select: { slug: true },
    })
    revalidateCmsPage(page.slug)
  } catch {
    return { error: "Could not save page." }
  }

  revalidatePath("/admin/settings/pages")
  revalidatePath(`/admin/settings/pages/${parsed.data.id}`)
  redirect(`/admin/settings/pages/${parsed.data.id}?saved=1`)
}

export const saveOutletAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminSettings("/admin/settings/outlets")
  const id = typeof formData.get("id") === "string" && formData.get("id") ? String(formData.get("id")) : undefined

  const parsed = outletFormSchema.safeParse({
    id,
    name: formData.get("name") ?? "",
    address: formData.get("address") ?? "",
    phone: formData.get("phone") ?? "",
    mapUrl: formData.get("mapUrl") ?? "",
    hours: formData.get("hours") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const data = {
    name: parsed.data.name,
    address: parsed.data.address,
    phone: parsed.data.phone?.trim() ? parsed.data.phone.trim() : null,
    mapUrl: parsed.data.mapUrl?.trim() ? parsed.data.mapUrl.trim() : null,
    hours: parsed.data.hours?.trim() ? parsed.data.hours.trim() : null,
    sortOrder: parsed.data.sortOrder,
  }

  try {
    if (parsed.data.id) {
      await db.outlet.update({ where: { id: parsed.data.id }, data })
      revalidateStoreSettings()
      revalidatePath("/admin/settings/outlets")
      redirect(`/admin/settings/outlets/${parsed.data.id}?saved=1`)
    }
    const created = await db.outlet.create({ data })
    revalidateStoreSettings()
    revalidatePath("/admin/settings/outlets")
    redirect(`/admin/settings/outlets/${created.id}`)
  } catch {
    return { error: "Could not save outlet." }
  }
}

export const deleteOutletFormAction = async (formData: FormData) => {
  await requireAdminSettings("/admin/settings/outlets")
  const id = String(formData.get("id") ?? "")
  if (!z.string().cuid().safeParse(id).success) return

  await db.outlet.delete({ where: { id } })
  revalidateStoreSettings()
  revalidatePath("/admin/settings/outlets")
  redirect("/admin/settings/outlets")
}

export const saveZoneAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminSettings("/admin/settings/delivery-zones")
  const parsed = zoneFormSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") ?? "",
    fee: formData.get("fee") ?? 0,
    etaMinDays: formData.get("etaMinDays") ?? 0,
    etaMaxDays: formData.get("etaMaxDays") ?? 0,
    isActive: formData.get("isActive") === "on",
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  if (parsed.data.etaMaxDays < parsed.data.etaMinDays) {
    return { error: "Max delivery days must be at least min days." }
  }

  try {
    await db.deliveryZone.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        fee: parsed.data.fee,
        etaMinDays: parsed.data.etaMinDays,
        etaMaxDays: parsed.data.etaMaxDays,
        isActive: parsed.data.isActive,
      },
    })
  } catch {
    return { error: "Could not save delivery zone." }
  }

  revalidatePath("/admin/settings/delivery-zones")
  revalidatePath(`/admin/settings/delivery-zones/${parsed.data.id}`)
  redirect(`/admin/settings/delivery-zones/${parsed.data.id}?saved=1`)
}

export const addZoneDistrictAction = async (_: AdminActionState, formData: FormData): Promise<AdminActionState> => {
  await requireAdminSettings("/admin/settings/delivery-zones")
  const parsed = zoneDistrictSchema.safeParse({
    zoneId: formData.get("zoneId"),
    district: formData.get("district") ?? "",
  })
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors }

  try {
    await db.deliveryZoneDistrict.upsert({
      where: { district: parsed.data.district },
      create: { district: parsed.data.district, zoneId: parsed.data.zoneId },
      update: { zoneId: parsed.data.zoneId },
    })
  } catch {
    return { error: "Could not assign district." }
  }

  revalidatePath(`/admin/settings/delivery-zones/${parsed.data.zoneId}`)
  return { ok: true }
}

export const removeZoneDistrictFormAction = async (formData: FormData) => {
  await requireAdminSettings("/admin/settings/delivery-zones")
  const district = String(formData.get("district") ?? "")
  const zoneId = String(formData.get("zoneId") ?? "")
  if (!district) return

  await db.deliveryZoneDistrict.deleteMany({ where: { district } })
  revalidatePath(`/admin/settings/delivery-zones/${zoneId}`)
}
