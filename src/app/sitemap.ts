import type { MetadataRoute } from "next"

import { db } from "@/lib/db"

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, collections] = await Promise.all([
    db.product.findMany({
      where: { status: { in: ["ACTIVE", "PREORDER"] } },
      select: { slug: true, updatedAt: true },
    }),
    db.brand.findMany({ select: { slug: true, updatedAt: true } }),
    db.collection.findMany({ select: { slug: true, updatedAt: true } }),
  ])
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site}/phones`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/search`, changeFrequency: "weekly", priority: 0.5 },
  ]
  return [
    ...staticRoutes,
    ...brands.map((brand) => ({
      url: `${site}/brands/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...collections.map((collection) => ({
      url: `${site}/collections/${collection.slug}`,
      lastModified: collection.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${site}/phones/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ]
}
