"use client"

const KEY = "mobigo_recently_viewed"
const MAX = 4

export type RecentProduct = {
  slug: string
  name: string
  brandName: string
  imageUrl: string | null
}

export const readRecentlyViewed = (): RecentProduct[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentProduct[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const recordRecentlyViewed = (item: RecentProduct) => {
  const withoutCurrent = readRecentlyViewed().filter((entry) => entry.slug !== item.slug)
  const next = [item, ...withoutCurrent].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event("mobigo-recently-viewed-updated"))
}
