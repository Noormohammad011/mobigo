"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useSyncExternalStore } from "react"

import { recordRecentlyViewed, readRecentlyViewed, type RecentProduct } from "@/lib/recently-viewed"

export const RecordRecentView = ({ item }: { item: RecentProduct }) => {
  useEffect(() => {
    recordRecentlyViewed(item)
  }, [item])
  return null
}

const SERVER_SNAPSHOT: RecentProduct[] = []

const snapshotCache = new Map<string, { key: string; value: RecentProduct[] }>()

const getClientSnapshot = (currentSlug: string): RecentProduct[] => {
  const filtered = readRecentlyViewed().filter((entry) => entry.slug !== currentSlug)
  const key = filtered.map((entry) => entry.slug).join("\0")
  const cached = snapshotCache.get(currentSlug)
  if (cached && cached.key === key) return cached.value
  snapshotCache.set(currentSlug, { key, value: filtered })
  return filtered
}

const subscribeRecent = (onChange: () => void) => {
  const handler = () => onChange()
  window.addEventListener("storage", handler)
  window.addEventListener("mobigo-recently-viewed-updated", handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener("mobigo-recently-viewed-updated", handler)
  }
}

export const RecentlyViewedRow = ({ currentSlug }: { currentSlug: string }) => {
  const items = useSyncExternalStore(
    subscribeRecent,
    () => getClientSnapshot(currentSlug),
    () => SERVER_SNAPSHOT
  )

  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10" aria-labelledby="recently-viewed-heading">
      <h2 id="recently-viewed-heading" className="font-display text-h2 text-foreground">
        Recently viewed
      </h2>
      <ul className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {items.map((product) => (
          <li key={product.slug} className="w-40 shrink-0">
            <Link href={`/phones/${product.slug}`} className="flex flex-col gap-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt="" width={160} height={160} unoptimized={product.imageUrl.endsWith(".svg")} className="size-full object-contain" />
                ) : (
                  <div className="size-full bg-skeleton" />
                )}
              </div>
              <span className="line-clamp-2 text-body-sm font-medium text-foreground">{product.name}</span>
              <span className="text-caption text-muted-foreground">{product.brandName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
