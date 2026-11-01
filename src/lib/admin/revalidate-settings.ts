import "server-only"

import { revalidateTag } from "next/cache"

export const revalidateStoreSettings = () => {
  revalidateTag("settings", "max")
  revalidateTag("outlets", "max")
}

export const revalidateCmsPage = (slug: string) => {
  revalidateTag("pages", "max")
  revalidateTag(`page:${slug}`, "max")
}
