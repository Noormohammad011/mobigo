import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** H2 on the left, optional "View all →" link and extra controls on the right (§7.13). */
export function SectionHeader({
  id,
  title,
  href,
  linkLabel = "View all",
  children,
  className,
}: {
  id: string
  title: string
  href?: string
  linkLabel?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 id={id} className="text-h2">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {href && (
          <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-1 rounded-sm px-1 text-body-sm font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            {linkLabel}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">: {title}</span>
          </Link>
        )}
        {children}
      </div>
    </div>
  )
}
