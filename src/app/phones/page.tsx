import { Suspense } from "react"
import type { Metadata } from "next"

import { PhoneListingFallback } from "@/components/listing/phone-listing-fallback"
import { PhoneListing } from "@/components/listing/phone-listing"
import { track } from "@/lib/analytics"
import { assertFlag, isFlagOn } from "@/lib/flags"
import { parseListingQuery, toListingSearch } from "@/lib/listing-params"
import { getPhoneListing } from "@/lib/queries/listing"

type Search = Record<string, string | string[] | undefined>

const title = "Mobile phones in Bangladesh"
const intro = "Official handsets with a clear price, warranty, and cash on delivery."

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<Search>
}): Promise<Metadata> => {
  const query = parseListingQuery(await searchParams)
  const search = toListingSearch(query)
  return {
    title,
    description: intro,
    alternates: { canonical: search ? `/phones${search}` : "/phones" },
  }
}

const PhonesListingContent = async ({ searchParams }: { searchParams: Promise<Search> }) => {
  await assertFlag("product_listing")
  const query = parseListingQuery(await searchParams)
  const [result, compareEnabled] = await Promise.all([getPhoneListing(query), isFlagOn("compare")])
  track({ name: "page_view", path: "/phones" })
  return (
    <PhoneListing
      title={title}
      intro={intro}
      path="/phones"
      query={query}
      result={result}
      compareEnabled={compareEnabled}
    />
  )
}

export default function PhonesPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <Suspense fallback={<PhoneListingFallback title={title} intro={intro} />}>
      <PhonesListingContent searchParams={searchParams} />
    </Suspense>
  )
}
