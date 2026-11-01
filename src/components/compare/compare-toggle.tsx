"use client"

import { ArrowLeftRightIcon } from "lucide-react"
import { useSyncExternalStore } from "react"

import {
  addCompareSlug,
  COMPARE_SERVER_SNAPSHOT,
  getCompareSnapshot,
  removeCompareSlug,
  subscribeCompare,
} from "@/lib/compare/compare-list"
import { cn } from "@/lib/utils"

export const CompareToggle = ({
  productId,
  slug,
  className,
}: {
  productId: string
  slug: string
  className?: string
}) => {
  const slugs = useSyncExternalStore(subscribeCompare, getCompareSnapshot, () => COMPARE_SERVER_SNAPSHOT)
  const active = slugs.includes(slug)

  const handleClick = () => {
    if (active) removeCompareSlug(slug)
    else addCompareSlug(slug, productId)
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from compare" : "Add to compare"}
      onClick={handleClick}
      className={cn(
        "relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-muted",
        active && "border-primary bg-primary/10 text-primary",
        className
      )}
    >
      <ArrowLeftRightIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
