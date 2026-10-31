export const LISTING_PAGE_SIZE = 20

export const LISTING_SORTS = ["relevance", "newest", "price_asc", "price_desc", "saving"] as const
export type ListingSort = (typeof LISTING_SORTS)[number]

export const DISPLAY_BANDS = ["under6", "6to65", "over65"] as const
export type DisplayBand = (typeof DISPLAY_BANDS)[number]

export const BATTERY_BANDS = ["under4000", "4000to5000", "over5000"] as const
export type BatteryBand = (typeof BATTERY_BANDS)[number]

export type ListingQuery = {
  brandSlug?: string
  minPrice?: number
  maxPrice?: number
  ram?: number
  storage?: number
  network?: "G4" | "G5"
  display?: DisplayBand
  battery?: BatteryBand
  chipset?: string
  availability?: "in_stock" | "preorder"
  sort: ListingSort
  page: number
  productIds?: string[]
  searchQ?: string
}

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined

const whole = (value: string | null): number | undefined => {
  if (!value) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

export const parseListingQuery = (
  input: Record<string, string | string[] | undefined>,
  fixed?: { brandSlug?: string }
): ListingQuery => {
  const get = (key: string) => {
    const value = input[key]
    return typeof value === "string" ? value : undefined
  }
  const networkRaw = get("network")
  const page = whole(get("page") ?? null) ?? 1
  return {
    brandSlug: fixed?.brandSlug ?? (get("brand") || undefined),
    minPrice: whole(get("min") ?? null),
    maxPrice: whole(get("max") ?? null),
    ram: whole(get("ram") ?? null),
    storage: whole(get("storage") ?? null),
    network: networkRaw === "4g" ? "G4" : networkRaw === "5g" ? "G5" : undefined,
    display: oneOf(get("display") ?? null, DISPLAY_BANDS),
    battery: oneOf(get("battery") ?? null, BATTERY_BANDS),
    chipset: get("chipset")?.trim().slice(0, 40) || undefined,
    availability: oneOf(get("availability") ?? null, ["in_stock", "preorder"] as const),
    sort: oneOf(get("sort") ?? null, LISTING_SORTS) ?? "relevance",
    page: Math.max(1, page),
    searchQ: get("q") || undefined,
  }
}

export const listingHasFilters = (query: ListingQuery, fixedBrand?: string): boolean =>
  Boolean(
    (!fixedBrand && query.brandSlug) ||
      query.minPrice != null ||
      query.maxPrice != null ||
      query.ram != null ||
      query.storage != null ||
      query.network ||
      query.display ||
      query.battery ||
      query.chipset ||
      query.availability ||
      query.sort !== "relevance"
  )

/** Query string for links. Page is omitted on page 1. */
export const toListingSearch = (query: ListingQuery, page = query.page): string => {
  const params = new URLSearchParams()
  if (query.brandSlug) params.set("brand", query.brandSlug)
  if (query.minPrice != null) params.set("min", String(query.minPrice))
  if (query.maxPrice != null) params.set("max", String(query.maxPrice))
  if (query.ram != null) params.set("ram", String(query.ram))
  if (query.storage != null) params.set("storage", String(query.storage))
  if (query.network) params.set("network", query.network === "G5" ? "5g" : "4g")
  if (query.display) params.set("display", query.display)
  if (query.battery) params.set("battery", query.battery)
  if (query.chipset) params.set("chipset", query.chipset)
  if (query.availability) params.set("availability", query.availability)
  if (query.searchQ) params.set("q", query.searchQ)
  if (query.sort !== "relevance") params.set("sort", query.sort)
  if (page > 1) params.set("page", String(page))
  const text = params.toString()
  return text ? `?${text}` : ""
}
