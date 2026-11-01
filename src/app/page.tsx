import type { Metadata } from "next"

import { BrandGrid } from "@/components/home/brand-grid"
import { BudgetTiles } from "@/components/home/budget-tiles"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { SeoBlock } from "@/components/home/seo-block"
import { Shelf } from "@/components/home/shelf"
import { TrustStrip } from "@/components/home/trust-strip"
import { getBrandTiles, getHomeBanners, getHomeShelves } from "@/lib/queries/home"
import { getStoreContact } from "@/lib/queries/shell"
import { isFlagOn } from "@/lib/flags"

export const metadata: Metadata = {
  title: { absolute: "MobiGo: Official Phones in Bangladesh · Cash on Delivery" },
  description:
    "Buy official Samsung, Apple, Xiaomi, OnePlus, realme and Google phones in Bangladesh. Official warranty, fast delivery, and you pay when it arrives.",
  alternates: { canonical: "/" },
}

/**
 * Home — PRD §4.2 (H-1…H-6). All data reads are "use cache" (lib/queries), so the page
 * prerenders as static HTML and refreshes when the cache tags are revalidated.
 */
export default async function HomePage() {
  const [banners, shelves, brands, contact, compareEnabled] = await Promise.all([
    getHomeBanners(),
    getHomeShelves(),
    getBrandTiles(),
    getStoreContact(),
    isFlagOn("compare"),
  ])

  // Interleave the budget tiles after the first two shelves, as on the reference stores.
  const [first, second, ...rest] = shelves

  return (
    <div className="page-container flex flex-col gap-8 pt-3 pb-10 lg:gap-14 lg:pt-6 lg:pb-16">
      <h1 className="sr-only">MobiGo: official phones in Bangladesh with cash on delivery</h1>
      <OrganizationJsonLd phone={contact.phone} email={contact.email} />

      <HeroCarousel slides={banners.hero} side={banners.side} />
      <TrustStrip />
      <BrandGrid brands={brands} />
      {first && <Shelf shelf={first} compareEnabled={compareEnabled} />}
      {second && <Shelf shelf={second} compareEnabled={compareEnabled} />}
      <BudgetTiles />
      {rest.map((s) => (
        <Shelf key={s.id} shelf={s} compareEnabled={compareEnabled} />
      ))}
      <SeoBlock />
    </div>
  )
}

function OrganizationJsonLd({ phone, email }: { phone: string | null; email: string | null }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mobigo.example"
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "MobiGo",
      url: site,
      ...(phone || email
        ? { contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: phone ?? undefined, email: email ?? undefined, areaServed: "BD" } }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MobiGo",
      url: site,
      potentialAction: {
        "@type": "SearchAction",
        target: `${site}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ]
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
