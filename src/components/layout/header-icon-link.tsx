import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

// 44px round icon target on the dark header (DESIGN_SYSTEM §7.3, icons 24px white).
export const headerIconClass =
  "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-header-foreground transition-colors duration-150 ease-brand outline-none hover:bg-ink-900 focus-visible:ring-3 focus-visible:ring-primary-400 [&_svg]:size-6"

export function HeaderIconLink({
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link className={cn(headerIconClass, className)} {...props}>
      {children}
    </Link>
  )
}
