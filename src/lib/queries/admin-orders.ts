import "server-only"

import type { OrderStatus, Prisma } from "@/generated/prisma/client"
import { normalizeBdPhone } from "@/lib/auth/phone"
import { db } from "@/lib/db"

const PAGE_SIZE = 20

export type AdminOrderListFilters = {
  status?: OrderStatus[]
  placedFrom?: Date
  placedTo?: Date
  q?: string
  page?: number
}

export const listAdminOrders = async (filters: AdminOrderListFilters) => {
  const page = Math.max(1, filters.page ?? 1)
  const where: Prisma.OrderWhereInput = {}

  if (filters.status?.length) {
    where.status = { in: filters.status }
  }

  if (filters.placedFrom || filters.placedTo) {
    where.placedAt = {}
    if (filters.placedFrom) where.placedAt.gte = filters.placedFrom
    if (filters.placedTo) where.placedAt.lte = filters.placedTo
  }

  const q = filters.q?.trim()
  if (q) {
    const phone = normalizeBdPhone(q)
    if (phone) {
      where.customerPhone = phone
    } else {
      where.orderNumber = { contains: q, mode: "insensitive" }
    }
  }

  const [total, rows] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        customerName: true,
        customerPhone: true,
        total: true,
        placedAt: true,
        paymentStatus: true,
      },
    }),
  ])

  return { rows, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export const getAdminOrder = async (id: string) =>
  db.order.findUnique({
    where: { id },
    include: {
      items: true,
      deliveryZone: { select: { name: true } },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
    },
  })

export const ADMIN_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]

export const parseAdminOrderListFilters = (searchParams: Record<string, string | string[] | undefined>): AdminOrderListFilters => {
  const rawStatus = searchParams.status
  const statusList = (Array.isArray(rawStatus) ? rawStatus : rawStatus ? rawStatus.split(",") : [])
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is OrderStatus => ADMIN_ORDER_STATUSES.includes(s as OrderStatus))

  const pageRaw = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page, 10) : 1
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1

  const parseDate = (key: string) => {
    const raw = searchParams[key]
    if (typeof raw !== "string" || !raw.trim()) return undefined
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? undefined : d
  }

  const q = typeof searchParams.q === "string" ? searchParams.q : undefined

  return {
    status: statusList.length > 0 ? statusList : undefined,
    placedFrom: parseDate("from"),
    placedTo: parseDate("to"),
    q,
    page,
  }
}
