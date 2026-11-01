import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { PhoneListingFallback } from "@/components/listing/phone-listing-fallback"
import { PhoneListing } from "@/components/listing/phone-listing"
import { MetadataDynamicMarker } from "@/components/layout/metadata-dynamic-marker"
import { track } from "@/lib/analytics"
import { assertFlag, isFlagOn } from "@/lib/flags"
import { parseListingQuery } from "@/lib/listing-params"
import { getCollectionPageMeta } from "@/lib/queries/catalog-meta"
import { collectionListingMetadataForRoute, collectionStaticParams } from "@/lib/queries/route-metadata"
import { getPhoneListing } from "@/lib/queries/listing"

type Search = Record<string, string | string[] | undefined>

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}): Promise<Metadata> {
  return collectionListingMetadataForRoute(params, searchParams)
}

export async function generateStaticParams() {
  return collectionStaticParams()
}

const CollectionListingContent = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}) => {
  await connection()
  await assertFlag("product_listing")
  const { slug } = await params
  const collection = await getCollectionPageMeta(slug)
  if (!collection) notFound()
  const query = parseListingQuery(await searchParams)
  const [result, compareEnabled] = await Promise.all([
    getPhoneListing(query, { collectionSlug: slug }),
    isFlagOn("compare"),
  ])
  track({ name: "page_view", path: `/collections/${slug}` })
  return (
    <PhoneListing
      title={collection.title}
      intro={collection.description ?? "A curated shelf of phones."}
      path={`/collections/${slug}`}
      query={query}
      result={result}
      compareEnabled={compareEnabled}
    />
  )
}

export default function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}) {
  return (
    <>
      <Suspense fallback={<PhoneListingFallback />}>
        <CollectionListingContent params={params} searchParams={searchParams} />
      </Suspense>
      <MetadataDynamicMarker />
    </>
  )
}
