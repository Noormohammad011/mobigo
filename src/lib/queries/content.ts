import "server-only"

import { notFound } from "next/navigation"
import { cacheLife, cacheTag } from "next/cache"

import { db } from "@/lib/db"

export const getPublishedPage = async (slug: string) => {
  "use cache"
  cacheLife("hours")
  cacheTag("pages", `page:${slug}`)

  return db.page.findFirst({
    where: { slug, isPublished: true },
    select: { slug: true, title: true, content: true, metaDescription: true, updatedAt: true },
  })
}

export const requirePublishedPage = async (slug: string) => {
  const page = await getPublishedPage(slug)
  if (!page) notFound()
  return page
}
