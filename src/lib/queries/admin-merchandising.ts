import "server-only"

import { db } from "@/lib/db"

export const listAdminCollections = async () =>
  db.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      showOnHome: true,
      sortOrder: true,
      startsAt: true,
      endsAt: true,
      _count: { select: { items: true } },
    },
  })

export const getAdminCollection = async (id: string) =>
  db.collection.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      showOnHome: true,
      sortOrder: true,
      startsAt: true,
      endsAt: true,
      items: {
        orderBy: { position: "asc" },
        select: {
          productId: true,
          position: true,
          product: { select: { id: true, slug: true, name: true, brandName: true, minPrice: true } },
        },
      },
    },
  })

export const listAdminBanners = async (placement?: string) =>
  db.banner.findMany({
    where: placement ? { placement: placement as "HERO" | "HERO_SIDE" | "HOME_MID" | "PROMO_MODAL" } : undefined,
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  })

export const getAdminBanner = async (id: string) => db.banner.findUnique({ where: { id } })
