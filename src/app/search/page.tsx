import { Suspense } from "react"
import type { Metadata } from "next"

import { PhoneListingFallback } from "@/components/listing/phone-listing-fallback"
import { PhoneListing } from "@/components/listing/phone-listing"
import { MetadataDynamicMarker } from "@/components/layout/metadata-dynamic-marker"
import { track } from "@/lib/analytics"
import { assertFlag } from "@/lib/flags"
import { parseListingQuery } from "@/lib/listing-params"
import { searchMetadataForRoute } from "@/lib/queries/route-metadata"
import { getPhoneListing } from "@/lib/queries/listing"

type Search = Record<string, string | string[] | undefined>

const title = "Search results"
const intro = "Phones matching your search."

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  return searchMetadataForRoute(searchParams)
}

const SearchListingContent = async ({ searchParams }: { searchParams: Promise<Search> }) => {
  await assertFlag("search")
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q.trim() : ""
  if (!q) {
    return (
      <div className="page-container py-10">
        <h1 className="font-display text-h1 text-foreground">{title}</h1>
        <p className="mt-2 text-body text-muted-foreground">Type a phone or brand name in the search box.</p>
      </div>
    )
  }
  const query = parseListingQuery(params)
  const result = await getPhoneListing(query, { searchQuery: q })
  track({ name: "page_view", path: `/search?q=${encodeURIComponent(q)}` })
  return (
    <PhoneListing
      title={`Results for “${q}”`}
      intro={intro}
      path="/search"
      query={{ ...query, searchQ: q }}
      result={result}
    />
  )
}

export default function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <>
      <Suspense fallback={<PhoneListingFallback title={title} intro={intro} />}>
        <SearchListingContent searchParams={searchParams} />
      </Suspense>
      <MetadataDynamicMarker />
    </>
  )
}
