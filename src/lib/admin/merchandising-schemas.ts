import { z } from "zod"

import type { AdminActionState } from "@/lib/admin/catalog-schemas"

export type { AdminActionState }

const optionalUrl = z.string().trim().url("Enter a valid URL.").optional().or(z.literal(""))

const optionalDateTime = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  })

export const collectionFormSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(1, "Enter a title.").max(120),
  description: z.string().trim().max(2000).optional(),
  showOnHome: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  startsAt: optionalDateTime,
  endsAt: optionalDateTime,
})

export const collectionItemsSchema = z.object({
  collectionId: z.string().cuid(),
  productIds: z.array(z.string().cuid()).max(200),
})

const requiredUrl = z.string().trim().min(1, "Enter a URL.").url("Enter a valid URL.")

export const bannerFormSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(1, "Enter a title.").max(120),
  placement: z.enum(["HERO", "HERO_SIDE", "HOME_MID", "PROMO_MODAL"]),
  imageMobileUrl: requiredUrl,
  imageDesktopUrl: requiredUrl,
  alt: z.string().trim().min(1, "Enter alt text.").max(200),
  linkUrl: optionalUrl,
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.coerce.boolean(),
  startsAt: optionalDateTime,
  endsAt: optionalDateTime,
})

export const toDateTimeLocalValue = (date: Date | null | undefined) => {
  if (!date) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
