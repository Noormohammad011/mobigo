export const LISTING_PAGE_SIZE = 20

export const LISTING_SORTS = ["relevance", "newest", "price_asc", "price_desc", "saving"] as const
export type ListingSort = (typeof LISTING_SORTS)[number]

export const DISPLAY_BANDS = ["under6", "6to65", "over65"] as const
export type DisplayBand = (typeof DISPLAY_BANDS)[number]

export const BATTERY_BANDS = ["under4000", "4000to5000", "over5000"] as const
export type BatteryBand = (typeof BATTERY_BANDS)[number]

export const AVAILABILITIES = ["in_stock", "preorder"] as const
export type Availability = (typeof AVAILABILITIES)[number]

export const NETWORKS = ["G4", "G5"] as const
export type Network = (typeof NETWORKS)[number]

/** Common option sets for the checkbox filters. */
export const RAM_OPTIONS_GB = [2, 3, 4, 6, 8, 12, 16] as const
export const STORAGE_OPTIONS_GB = [32, 64, 128, 256, 512, 1024] as const
export const PRICE_SLIDER = { min: 0, max: 200_000, step: 1_000 } as const

/** Every list filter accepts several values (OR inside a group, AND across groups). */
export type ListingQuery = {
  brandSlugs: string[]
  minPrice?: number
  maxPrice?: number
  rams: number[]
  storages: number[]
  networks: Network[]
  displays: DisplayBand[]
  batteries: BatteryBand[]
  chipsets: string[]
  availabilities: Availability[]
  sort: ListingSort
  page: number
  productIds?: string[]
  searchQ?: string
}

type RawInput = Record<string, string | string[] | undefined>

const many = (input: RawInput, key: string): string[] => {
  const value = input[key]
  const list = Array.isArray(value) ? value : value ? [value] : []
  return [...new Set(list.map((v) => v.trim()).filter(Boolean))].slice(0, 20)
}

const oneOf = <T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined

const allOf = <T extends string>(values: string[], allowed: readonly T[]): T[] =>
  values.filter((v): v is T => (allowed as readonly string[]).includes(v))

const wholeNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

const wholeNumbers = (values: string[]): number[] =>
  values.map((v) => wholeNumber(v)).filter((n): n is number => n != null)

export const parseListingQuery = (input: RawInput, fixed?: { brandSlug?: string }): ListingQuery => {
  const first = (key: string) => many(input, key)[0]
  return {
    brandSlugs: fixed?.brandSlug ? [fixed.brandSlug] : many(input, "brand"),
    minPrice: wholeNumber(first("min")),
    maxPrice: wholeNumber(first("max")),
    rams: wholeNumbers(many(input, "ram")),
    storages: wholeNumbers(many(input, "storage")),
    networks: many(input, "network").flatMap((v) => (v === "4g" ? ["G4" as const] : v === "5g" ? ["G5" as const] : [])),
    displays: allOf(many(input, "display"), DISPLAY_BANDS),
    batteries: allOf(many(input, "battery"), BATTERY_BANDS),
    chipsets: many(input, "chipset").map((v) => v.slice(0, 40)),
    availabilities: allOf(many(input, "availability"), AVAILABILITIES),
    sort: oneOf(first("sort"), LISTING_SORTS) ?? "relevance",
    page: Math.max(1, wholeNumber(first("page")) ?? 1),
    searchQ: first("q"),
  }
}

/** How many filters are active (a price range counts once). Sort and search are not filters. */
export const countActiveFilters = (query: ListingQuery, fixedBrand = false): number =>
  (fixedBrand ? 0 : query.brandSlugs.length) +
  (query.minPrice != null || query.maxPrice != null ? 1 : 0) +
  query.rams.length +
  query.storages.length +
  query.networks.length +
  query.displays.length +
  query.batteries.length +
  query.chipsets.length +
  query.availabilities.length

export const listingHasFilters = (query: ListingQuery, fixedBrand = false): boolean =>
  countActiveFilters(query, fixedBrand) > 0 || query.sort !== "relevance"

/** Query string for links. Page is omitted on page 1. */
export const toListingSearch = (query: ListingQuery, page = query.page): string => {
  const params = new URLSearchParams()
  query.brandSlugs.forEach((v) => params.append("brand", v))
  if (query.minPrice != null) params.set("min", String(query.minPrice))
  if (query.maxPrice != null) params.set("max", String(query.maxPrice))
  query.rams.forEach((v) => params.append("ram", String(v)))
  query.storages.forEach((v) => params.append("storage", String(v)))
  query.networks.forEach((v) => params.append("network", v === "G5" ? "5g" : "4g"))
  query.displays.forEach((v) => params.append("display", v))
  query.batteries.forEach((v) => params.append("battery", v))
  query.chipsets.forEach((v) => params.append("chipset", v))
  query.availabilities.forEach((v) => params.append("availability", v))
  if (query.searchQ) params.set("q", query.searchQ)
  if (query.sort !== "relevance") params.set("sort", query.sort)
  if (page > 1) params.set("page", String(page))
  const text = params.toString()
  return text ? `?${text}` : ""
}
