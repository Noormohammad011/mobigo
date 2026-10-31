import { ShoppingCartIcon } from "lucide-react"

import { HeaderIconLink } from "./header-icon-link"

/**
 * Cart icon with count badge (DESIGN_SYSTEM §7.3). The count comes from the
 * guest/server cart, which lands in M2 (PRD CA-2); until then no badge shows.
 */
export function CartLink({ count = 0 }: { count?: number }) {
  const label = count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"
  return (
    <HeaderIconLink href="/cart" aria-label={label}>
      <ShoppingCartIcon strokeWidth={1.75} aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0.5 flex size-[18px] items-center justify-center rounded-full bg-primary-500 text-caption leading-none font-semibold text-white ring-2 ring-header"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </HeaderIconLink>
  )
}
