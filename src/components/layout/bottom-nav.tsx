"use client"

import { BadgePercentIcon, HouseIcon, LayoutGridIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const TABS = [
  { label: "Home", href: "/", icon: HouseIcon, match: (p: string) => p === "/" },
  { label: "Brands", href: "/brands", icon: LayoutGridIcon, match: (p: string) => p.startsWith("/brands") },
  { label: "Offers", href: "/offers", icon: BadgePercentIcon, match: (p: string) => p.startsWith("/offers") },
  {
    label: "Account",
    href: "/account",
    icon: UserIcon,
    match: (p: string) => p.startsWith("/account") || p.startsWith("/auth"),
  },
] as const

/** PRD G-3, DESIGN_SYSTEM §7.3: fixed 64px tab bar below lg, active tab in primary. */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-bar border-t border-border bg-background pb-safe shadow-bar lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {TABS.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px] leading-none font-medium transition-colors duration-150 ease-brand outline-none focus-visible:bg-accent",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
