"use client"

import { ArrowLeftRightIcon, BadgePercentIcon, ChevronRightIcon, MenuIcon, PackageSearchIcon, SmartphoneIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Wordmark } from "@/components/brand/wordmark"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { headerIconClass } from "./header-icon-link"
import { BUDGET_BANDS, HELP_LINKS, type NavBrand } from "./nav"

const QUICK_LINKS = [
  { label: "All phones", href: "/phones", icon: SmartphoneIcon },
  { label: "Offers", href: "/offers", icon: BadgePercentIcon },
  { label: "Compare", href: "/compare", icon: ArrowLeftRightIcon },
  { label: "Track order", href: "/track", icon: PackageSearchIcon },
  { label: "My account", href: "/account", icon: UserIcon },
] as const

/** Left drawer for < lg (DESIGN_SYSTEM §6: desktop nav appears at lg). */
export function MobileMenu({ brands }: { brands: NavBrand[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<button type="button" className={`${headerIconClass} -ml-2 lg:hidden`} />}>
        <MenuIcon strokeWidth={1.75} aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="bg-header px-4 py-4">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Wordmark />
        </SheetHeader>

        <nav aria-label="Menu" className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5 pb-safe">
          <ul className="grid gap-1">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className="flex h-12 items-center gap-3 rounded-md px-3 text-body font-medium text-foreground transition-colors duration-150 ease-brand outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {brands.length > 0 && (
            <section aria-labelledby="menu-brands">
              <div className="mb-2 flex items-center justify-between px-3">
                <h2 id="menu-brands" className="text-overline text-muted-foreground uppercase">
                  Shop by brand
                </h2>
                <Link href="/brands" onClick={close} className="text-caption font-semibold text-link hover:underline">
                  All brands
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {brands.map((brand) => (
                  <li key={brand.slug}>
                    <Link
                      href={`/brands/${brand.slug}`}
                      onClick={close}
                      className="flex h-11 items-center justify-between rounded-md border border-border px-3 text-body-sm font-medium text-foreground transition-colors duration-150 ease-brand outline-none hover:border-primary hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      {brand.name}
                      <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="menu-budget">
            <h2 id="menu-budget" className="mb-2 px-3 text-overline text-muted-foreground uppercase">
              Shop by budget
            </h2>
            <ul className="flex flex-wrap gap-2">
              {BUDGET_BANDS.map((band) => (
                <li key={band.href}>
                  <Link
                    href={band.href}
                    onClick={close}
                    className="inline-flex h-9 items-center rounded-full border border-border px-4 text-body-sm font-medium text-foreground transition-colors duration-150 ease-brand outline-none hover:border-primary hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    {band.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="menu-help" className="border-t border-border pt-4">
            <h2 id="menu-help" className="mb-1 px-3 text-overline text-muted-foreground uppercase">
              Help
            </h2>
            <ul>
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="flex h-11 items-center rounded-md px-3 text-body-sm text-muted-foreground transition-colors duration-150 ease-brand outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
