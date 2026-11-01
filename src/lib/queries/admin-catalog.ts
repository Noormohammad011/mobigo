import "server-only"

import { db } from "@/lib/db"
import type { Prisma, ProductStatus } from "@/generated/prisma/client"

export const listAdminBrands = async () =>
  db.brand.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })

export const getAdminBrand = async (id: string) => db.brand.findUnique({ where: { id } })

export type AdminProductListQuery = {
  q?: string
  brandId?: string
  status?: ProductStatus
  page?: number
}

const PAGE_SIZE = 20

export const listAdminProducts = async (query: AdminProductListQuery) => {
  const page = Math.max(1, query.page ?? 1)
  const where: Prisma.ProductWhereInput = {}
  if (query.brandId) where.brandId = query.brandId
  if (query.status) where.status = query.status
  if (query.q?.trim()) {
    const term = query.q.trim()
    where.OR = [{ name: { contains: term, mode: "insensitive" } }, { slug: { contains: term, mode: "insensitive" } }]
  }

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        minPrice: true,
        inStock: true,
        brand: { select: { name: true } },
        updatedAt: true,
      },
    }),
    db.product.count({ where }),
  ])

  return { items, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export const getAdminProductEdit = async (id: string) => {
  const [product, specGroups] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        colors: { orderBy: { sortOrder: "asc" }, include: { images: { orderBy: { sortOrder: "asc" } } } },
        variants: { orderBy: { createdAt: "asc" } },
        specs: true,
      },
    }),
    db.specGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        attributes: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, unit: true } },
      },
    }),
  ])
  return { product, specGroups }
}

export const listBrandOptions = async () =>
  db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
