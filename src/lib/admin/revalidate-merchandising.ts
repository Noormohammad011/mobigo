import "server-only"

import { revalidateTag } from "next/cache"

export const revalidateMerchandising = () => {
  revalidateTag("collections", "max")
  revalidateTag("banners", "max")
  revalidateTag("products", "max")
}
