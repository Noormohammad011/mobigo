import { getCurrentUser } from "@/lib/auth/session"
import { getCartUnitCount } from "@/lib/cart/get-cart"

import { CartLinkWithCount } from "./cart-link-with-count"

/** Reads session cookies; must render inside Suspense so cached pages can prerender. */
export async function HeaderCartSlot() {
  const user = await getCurrentUser()
  const serverCartCount = user ? await getCartUnitCount(user.id) : 0
  return <CartLinkWithCount signedIn={Boolean(user)} serverCount={serverCartCount} />
}
