import { BadgePercentIcon, HouseIcon, LayoutGridIcon, UserIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

const tabs = [
  { label: "Home", href: "/", icon: HouseIcon },
  { label: "Brands", href: "/brands", icon: LayoutGridIcon },
  { label: "Offers", href: "/offers", icon: BadgePercentIcon },
  { label: "Account", href: "/account", icon: UserIcon },
] as const

/** Same chrome as BottomNav before pathname is available. All tabs use inactive styling. */
export const BottomNavFallback = () => (
  <nav
    aria-label="Main"
    aria-busy="true"
    className="fixed inset-x-0 bottom-0 z-bar border-t border-border bg-background pb-safe shadow-bar lg:hidden"
  >
    <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
      {tabs.map(({ label, href, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className={cn(
              "flex h-full flex-col items-center justify-center gap-1 text-[11px] leading-none font-medium text-muted-foreground outline-none focus-visible:bg-accent"
            )}
          >
            <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
)
