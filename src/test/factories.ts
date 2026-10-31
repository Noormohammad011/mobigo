import { db } from "@/lib/db"

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "brand"

/** Insert a brand inside the current test transaction. */
export const makeBrand = (overrides: { name: string; sortOrder?: number }) =>
  db.brand.create({
    data: {
      name: overrides.name,
      slug: `${slugify(overrides.name)}-${overrides.sortOrder ?? 0}`,
      sortOrder: overrides.sortOrder ?? 0,
    },
  })
