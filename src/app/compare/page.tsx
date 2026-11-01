import type { Metadata } from "next"
import { connection } from "next/server"
import { Suspense } from "react"

import { CompareView } from "@/components/compare/compare-view"
import { PhoneListingFallback } from "@/components/listing/phone-listing-fallback"
import { getCompareTable } from "@/lib/queries/compare"
import { assertFlag } from "@/lib/flags"

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare phone specs side by side.",
  robots: { index: true, follow: true },
}

const parseSlugs = (raw: string | undefined): string[] => {
  if (!raw) return []
  return raw
    .split(",")
    .map((entry) => decodeURIComponent(entry.trim()))
    .filter(Boolean)
    .slice(0, 3)
}

const CompareBody = async ({ searchParams }: { searchParams: Promise<{ slugs?: string }> }) => {
  await connection()
  await assertFlag("compare")
  const params = await searchParams
  const slugs = parseSlugs(typeof params.slugs === "string" ? params.slugs : undefined)
  const initial = slugs.length > 0 ? await getCompareTable(slugs) : { products: [], droppedSlugs: [], groups: [] }
  return <CompareView initial={initial} initialSlugs={slugs} />
}

export default function ComparePage({ searchParams }: { searchParams: Promise<{ slugs?: string }> }) {
  return (
    <Suspense fallback={<PhoneListingFallback title="Compare" intro="Loading comparison…" />}>
      <CompareBody searchParams={searchParams} />
    </Suspense>
  )
}
