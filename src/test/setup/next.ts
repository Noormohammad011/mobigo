import { vi } from "vitest"

vi.mock("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))
