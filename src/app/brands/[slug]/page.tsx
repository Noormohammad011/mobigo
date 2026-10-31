import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PhoneListingFallback } from "@/components/listing/phone-listing-fallback"
import { PhoneListing } from "@/components/listing/phone-listing"
import { MetadataDynamicMarker } from "@/components/layout/metadata-dynamic-marker"
import { track } from "@/lib/analytics"
import { assertFlag } from "@/lib/flags"
import { parseListingQuery } from "@/lib/listing-params"
import { getBrandPageMeta } from "@/lib/queries/catalog-meta"
import { brandListingMetadataForRoute, brandStaticParams } from "@/lib/queries/route-metadata"
import { getPhoneListing } from "@/lib/queries/listing"

type Search = Record<string, string | string[] | undefined>

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}): Promise<Metadata> {
  return brandListingMetadataForRoute(params, searchParams)
}

export async function generateStaticParams() {
  return brandStaticParams()
}

const BrandListingContent = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}) => {
  await assertFlag("product_listing")
  const { slug } = await params
  const brand = await getBrandPageMeta(slug)
  if (!brand) notFound()
  const query = parseListingQuery(await searchParams, { brandSlug: slug })
  const result = await getPhoneListing(query)
  track({ name: "page_view", path: `/brands/${slug}` })
  return (
    <PhoneListing
      title={`${brand.name} phones`}
      intro={`Every ${brand.name} handset we sell, with filters you can share.`}
      path={`/brands/${slug}`}
      query={query}
      fixedBrand
      result={result}
    />
  )
}

export default function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}) {
  return (
    <>
      <Suspense fallback={<PhoneListingFallback />}>
        <BrandListingContent params={params} searchParams={searchParams} />
      </Suspense>
      <MetadataDynamicMarker />
    </>
  )
}
