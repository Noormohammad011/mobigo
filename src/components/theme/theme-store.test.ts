// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { refreshThemeOnDocument, setThemePreference, subscribe, THEME_STORAGE_KEY } from "./theme-store"

describe("theme-store apply", () => {
  beforeEach(() => {
    document.documentElement.className = ""
    document.documentElement.style.colorScheme = ""
    localStorage.clear()
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    )
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
  })

  it("adds dark class for dark preference", () => {
    setThemePreference("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe("dark")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
  })

  it("removes dark class for light preference", () => {
    document.documentElement.classList.add("dark")
    setThemePreference("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe("light")
  })

  it("re-applies stored preference when subscribe mounts", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark")
    document.documentElement.classList.remove("dark")
    const unsub = subscribe(() => {})
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    unsub()
  })

  it("refreshThemeOnDocument restores dark after html class is reset", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark")
    document.documentElement.className = "h-full"
    refreshThemeOnDocument()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })
})
