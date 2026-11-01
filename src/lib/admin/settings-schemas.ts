import { z } from "zod"

export const contactSettingsSchema = z.object({
  support_phone: z.string().trim().max(40).optional(),
  support_email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  whatsapp_number: z.string().trim().max(20).optional(),
  facebook_url: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  youtube_url: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  order_max_subtotal: z.coerce.number().int().min(1000, "Cap must be at least ৳1,000.").max(10_000_000),
})

export const pageFormSchema = z.object({
  id: z.string().cuid(),
  title: z.string().trim().min(1, "Enter a title.").max(120),
  content: z.string().trim().min(1, "Enter page content."),
  metaDescription: z.string().trim().max(300).optional(),
  isPublished: z.coerce.boolean(),
})

export const outletFormSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1, "Enter a name.").max(120),
  address: z.string().trim().min(1, "Enter an address.").max(500),
  phone: z.string().trim().max(40).optional(),
  mapUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  hours: z.string().trim().max(200).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
})

export const zoneFormSchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1, "Enter a zone name.").max(80),
  fee: z.coerce.number().int().min(0).max(100_000),
  etaMinDays: z.coerce.number().int().min(0).max(30),
  etaMaxDays: z.coerce.number().int().min(0).max(60),
  isActive: z.coerce.boolean(),
})

export const zoneDistrictSchema = z.object({
  zoneId: z.string().cuid(),
  district: z.string().trim().min(1, "Enter a district name.").max(80),
})
