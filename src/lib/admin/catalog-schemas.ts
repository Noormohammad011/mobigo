import { z } from "zod"

export const brandFormSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1, "Enter a brand name.").max(100),
  logoUrl: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional(),
  isFeatured: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
})

export type BrandFormInput = z.infer<typeof brandFormSchema>

const money = z.coerce.number().int().min(0, "Price must be zero or more.")
const positiveMoney = z.coerce.number().int().min(1, "Price must be at least ৳1.")

export const variantRowSchema = z.object({
  id: z.string().cuid().optional(),
  colorId: z.string().min(1, "Pick a color."),
  ramGb: z.coerce.number().int().min(1).max(64),
  storageGb: z.coerce.number().int().min(32).max(2048),
  sku: z.string().trim().min(1).max(80),
  price: positiveMoney,
  compareAtPrice: money.optional().nullable(),
  stock: z.coerce.number().int().min(0).max(99999),
  warrantyType: z.enum(["OFFICIAL", "UNOFFICIAL"]),
  isActive: z.coerce.boolean(),
})

export const colorRowSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1).max(60),
  hex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #5B4B8A."),
  sortOrder: z.coerce.number().int().min(0).max(99),
})

export const specValueRowSchema = z.object({
  attributeId: z.string().cuid(),
  value: z.string().trim().max(500),
})

export const productFormSchema = z.object({
  id: z.string().cuid().optional(),
  brandId: z.string().cuid(),
  name: z.string().trim().min(1).max(160),
  modelNumber: z.string().trim().max(80).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PREORDER", "DISCONTINUED"]),
  releaseDate: z.string().optional(),
  shortDescription: z.string().trim().max(400).optional(),
  description: z.string().trim().max(50000).optional(),
  metaTitle: z.string().trim().max(120).optional(),
  metaDescription: z.string().trim().max(320).optional(),
  network: z.enum(["G4", "G5"]).optional().nullable(),
  displaySizeIn: z.coerce.number().min(4).max(8).optional().nullable(),
  batteryMah: z.coerce.number().int().min(1000).max(12000).optional().nullable(),
  chipsetBrand: z.string().trim().max(60).optional(),
  colors: z.array(colorRowSchema).min(1, "Add at least one color."),
  variants: z.array(variantRowSchema).min(1, "Add at least one variant."),
  specValues: z.array(specValueRowSchema),
})

export type ProductFormInput = z.infer<typeof productFormSchema> & { slug: string }

export type AdminActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  ok?: boolean
} | undefined
