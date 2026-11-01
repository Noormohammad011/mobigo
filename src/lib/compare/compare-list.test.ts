// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"

import { isCompareListInitialized, readCompareSlugs, removeCompareSlug } from "./compare-list"

const KEY = "mobigo_compare"

describe("compare-list remove last item", () => {
  afterEach(() => {
    localStorage.removeItem(KEY)
  })

  it("marks list initialized after remove leaves empty array", () => {
    localStorage.setItem(KEY, JSON.stringify(["galaxy-a17"]))
    removeCompareSlug("galaxy-a17")
    expect(readCompareSlugs()).toEqual([])
    expect(isCompareListInitialized()).toBe(true)
  })
})
