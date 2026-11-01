import { describe, expect, it } from "vitest"

import { countActiveFilters, listingHasFilters, parseListingQuery, toListingSearch } from "./listing-params"

describe("listing params (multi select)", () => {
  it("reads repeated params and round trips them", () => {
    const query = parseListingQuery({
      brand: ["apple", "samsung"],
      ram: ["8", "12"],
      network: "5g",
      display: ["6to65", "bogus"],
      min: "20000",
    })
    expect(query.brandSlugs).toEqual(["apple", "samsung"])
    expect(query.rams).toEqual([8, 12])
    expect(query.networks).toEqual(["G5"])
    expect(query.displays).toEqual(["6to65"])
    const again = parseListingQuery(Object.fromEntries(new URLSearchParams(toListingSearch(query)).entries()))
    expect(again.minPrice).toBe(20000)
  })

  it("keeps a single value working and drops duplicates and junk", () => {
    const query = parseListingQuery({ brand: ["apple", "apple", " "], ram: ["x", "-3", "6"], page: "0" })
    expect(query.brandSlugs).toEqual(["apple"])
    expect(query.rams).toEqual([6])
    expect(query.page).toBe(1)
  })

  it("a fixed brand page ignores the brand param and does not count it as a filter", () => {
    const query = parseListingQuery({ brand: "xiaomi" }, { brandSlug: "apple" })
    expect(query.brandSlugs).toEqual(["apple"])
    expect(countActiveFilters(query, true)).toBe(0)
    expect(listingHasFilters(query, true)).toBe(false)
  })

  it("counts a price range once", () => {
    const query = parseListingQuery({ min: "1000", max: "5000", network: ["4g", "5g"] })
    expect(countActiveFilters(query)).toBe(3)
  })
})
