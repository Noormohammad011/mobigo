"use client"

const KEY = "mobigo_compare"
const MAX = 3
const EMPTY: string[] = []

export const COMPARE_SERVER_SNAPSHOT = EMPTY

let snapshot: string[] = EMPTY
let snapshotKey = ""

export const readCompareSlugs = (): string[] => {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return EMPTY
    return parsed.filter((entry): entry is string => typeof entry === "string" && entry.length > 0).slice(0, MAX)
  } catch {
    return EMPTY
  }
}

export const getCompareSnapshot = (): string[] => {
  const next = readCompareSlugs()
  const key = JSON.stringify(next)
  if (key === snapshotKey) return snapshot
  snapshotKey = key
  snapshot = next
  return snapshot
}

export const subscribeCompare = (onChange: () => void) => {
  window.addEventListener("mobigo-compare-updated", onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener("mobigo-compare-updated", onChange)
    window.removeEventListener("storage", onChange)
  }
}

const writeCompareSlugs = (slugs: string[]) => {
  localStorage.setItem(KEY, JSON.stringify(slugs.slice(0, MAX)))
  window.dispatchEvent(new Event("mobigo-compare-updated"))
}

export const addCompareSlug = (slug: string, productId?: string): { added: boolean; slugs: string[] } => {
  const current = readCompareSlugs()
  if (current.includes(slug)) return { added: false, slugs: current }
  let next = [...current, slug]
  if (next.length > MAX) next = next.slice(next.length - MAX)
  writeCompareSlugs(next)
  if (productId) {
    import("@/lib/analytics/client").then(({ trackClient }) => {
      trackClient({ name: "compare_add", productId })
    })
  }
  return { added: true, slugs: next }
}

export const removeCompareSlug = (slug: string): string[] => {
  const next = readCompareSlugs().filter((entry) => entry !== slug)
  writeCompareSlugs(next)
  return next
}

/** Put a phone in compare slot index (0..2), replacing any phone already in that slot. */
export const setCompareSlugAtSlot = (slotIndex: number, slug: string, productId?: string): { slugs: string[] } => {
  const clamped = Math.max(0, Math.min(2, slotIndex))
  let current = readCompareSlugs().filter((entry) => entry !== slug)
  if (clamped < current.length) {
    current = [...current.slice(0, clamped), slug, ...current.slice(clamped + 1)]
  } else {
    current = [...current, slug]
  }
  const next = current.slice(0, MAX)
  writeCompareSlugs(next)
  if (productId) {
    import("@/lib/analytics/client").then(({ trackClient }) => {
      trackClient({ name: "compare_add", productId })
    })
  }
  return { slugs: next }
}

export const compareSlugsToSearch = (slugs: string[]): string => {
  if (slugs.length === 0) return ""
  return `?slugs=${slugs.map(encodeURIComponent).join(",")}`
}
