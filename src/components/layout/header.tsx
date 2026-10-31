import { ArrowLeftRightIcon, BadgePercentIcon, UserIcon } from "lucide-react"
import Link from "next/link"

import { Wordmark } from "@/components/brand/wordmark"
import { getNavBrands } from "@/lib/queries/shell"

import { CartLink } from "./cart-link"
import { HeaderIconLink } from "./header-icon-link"
import { MobileMenu } from "./mobile-menu"
import { BUDGET_BANDS, NAV_BRAND_LIMIT } from "./nav"
import { SearchBar } from "./search-bar"

const DESKTOP_LINKS = [
  { label: "Offers", href: "/offers", icon: BadgePercentIcon },
  { label: "Compare", href: "/compare", icon: ArrowLeftRightIcon },
] as const

/**
 * Global header (PRD G-1, G-2, G-4; DESIGN_SYSTEM §6, §7.3).
 * < md: [menu · logo · cart] then a separate sticky search row.
 * md: one row, search grows. lg: whole bar sticky, plus a brand/budget nav row.
 * The rows are siblings (not nested) so the mobile search row can stick to the viewport.
 */
export async function Header() {
  const brands = (await getNavBrands()).slice(0, NAV_BRAND_LIMIT)

  return (
    <>
      <header className="bg-header text-header-foreground lg:sticky lg:top-0 lg:z-header">
        <div className="page-container flex h-14 items-center gap-1 md:h-16 md:gap-4">
          <MobileMenu brands={brands} />
          <Link
            href="/"
            aria-label="MobiGo home"
            className="-mx-1 rounded-sm px-1 py-2 outline-none focus-visible:ring-3 focus-visible:ring-primary-400"
          >
            <Wordmark className="text-[22px] md:text-2xl" />
          </Link>

          <SearchBar id="search-desktop" className="hidden md:flex md:flex-1 lg:mx-4 lg:max-w-2xl" />

          <nav aria-label="Shortcuts" className="ml-auto hidden items-center gap-1 lg:flex">
            {DESKTOP_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-body-sm font-medium text-header-foreground transition-colors duration-150 ease-brand outline-none hover:bg-ink-900 focus-visible:ring-3 focus-visible:ring-primary-400"
              >
                <Icon className="size-5 text-primary-400" strokeWidth={1.75} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <CartLink />
            <HeaderIconLink href="/account" aria-label="My account" className="hidden lg:inline-flex">
              <UserIcon strokeWidth={1.75} aria-hidden="true" />
            </HeaderIconLink>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-header bg-header px-4 pt-1 pb-3 shadow-md md:hidden">
        <SearchBar id="search-mobile" />
      </div>

      <nav aria-label="Brands and budgets" className="hidden border-b border-border bg-background lg:block">
        <div className="page-container flex h-12 items-center gap-1 overflow-x-auto scrollbar-none">
          <Link href="/phones" className={brandNavLink}>
            All phones
          </Link>
          {brands.map((brand) => (
            <Link key={brand.slug} href={`/brands/${brand.slug}`} className={brandNavLink}>
              {brand.name}
            </Link>
          ))}
          <span aria-hidden="true" className="mx-2 h-5 w-px shrink-0 bg-border-strong" />
          {BUDGET_BANDS.map((band) => (
            <Link key={band.href} href={band.href} className={brandNavLink}>
              {band.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

const brandNavLink =
  "inline-flex h-9 shrink-0 items-center rounded-full px-3 text-body-sm font-medium whitespace-nowrap text-ink-700 transition-colors duration-150 ease-brand outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
