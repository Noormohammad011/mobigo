import "server-only"

import { revalidateTag } from "next/cache"

export const revalidateProductCatalog = (slug: string) => {
  revalidateTag("products", "max")
  revalidateTag("brands", "max")
  if (slug) revalidateTag(`product:${slug}`, "max")
}
