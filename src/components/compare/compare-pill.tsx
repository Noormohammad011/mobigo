"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"

import {
  compareSlugsToSearch,
  COMPARE_SERVER_SNAPSHOT,
  getCompareSnapshot,
  subscribeCompare,
} from "@/lib/compare/compare-list"
import { cn } from "@/lib/utils"

export const ComparePill = ({ enabled }: { enabled: boolean }) => {
  const slugs = useSyncExternalStore(subscribeCompare, getCompareSnapshot, () => COMPARE_SERVER_SNAPSHOT)
  if (!enabled || slugs.length === 0) return null

  return (
    <Link
      href={`/compare${compareSlugsToSearch(slugs)}`}
      className={cn(
        "fixed right-4 z-float inline-flex h-11 items-center rounded-full bg-primary px-4 text-body-sm font-semibold text-primary-foreground shadow-md",
        "bottom-[calc(64px+env(safe-area-inset-bottom)+12px)] lg:bottom-6"
      )}
    >
      Compare ({slugs.length})
    </Link>
  )
}
