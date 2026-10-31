import { describe, expect, it } from "vitest"

import { parseFlagsEnv } from "@/lib/flags"

describe("parseFlagsEnv", () => {
  it("turns all flags on", () => {
    const flags = parseFlagsEnv("all=on")
    expect(flags.product_detail).toBe(true)
    expect(flags.product_listing).toBe(true)
  })

  it("applies overrides after all=on", () => {
    const flags = parseFlagsEnv("all=on,cart=off")
    expect(flags.product_detail).toBe(true)
    expect(flags.cart).toBe(false)
  })
})
