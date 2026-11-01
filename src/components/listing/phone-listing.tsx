import Link from "next/link"

import { ProductCard } from "@/components/commerce/product-card"
import { buttonVariants } from "@/components/ui/button"
import { LISTING_PAGE_SIZE, listingHasFilters, toListingSearch, type ListingQuery } from "@/lib/listing-params"
import type { ListingResult } from "@/lib/queries/listing"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-11 w-full rounded-md border border-border-strong bg-card px-3 text-body-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40"

export const PhoneListing = ({
  title,
  intro,
  path,
  query,
  fixedBrand = false,
  result,
  compareEnabled = false,
}: {
  title: string
  intro: string
  path: string
  query: ListingQuery
  fixedBrand?: boolean
  result: ListingResult
  compareEnabled?: boolean
}) => {
  const pageCount = Math.max(1, Math.ceil(result.total / LISTING_PAGE_SIZE))
  const page = Math.min(query.page, pageCount)
  const clearHref = path
  const linkQuery = fixedBrand ? { ...query, brandSlug: undefined } : query
  const filtered = listingHasFilters(query, fixedBrand ? query.brandSlug : undefined)

  return (
    <div className="page-container flex flex-col gap-6 py-6 lg:py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-h1 text-foreground">{title}</h1>
        <p className="max-w-2xl text-body text-muted-foreground">{intro}</p>
        <p className="text-body-sm text-muted-foreground">Showing {result.total} items</p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <form method="get" action={path} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 lg:w-64 lg:shrink-0" aria-label="Filters">
          {!fixedBrand ? (
            <label className="flex flex-col gap-1 text-caption text-muted-foreground">
              Brand
              <select name="brand" defaultValue={query.brandSlug ?? ""} className={fieldClass}>
                <option value="">All brands</option>
                {result.brands.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Min price (BDT)
            <input name="min" type="number" min={0} defaultValue={query.minPrice ?? ""} className={fieldClass} inputMode="numeric" />
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Max price (BDT)
            <input name="max" type="number" min={0} defaultValue={query.maxPrice ?? ""} className={fieldClass} inputMode="numeric" />
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            RAM (GB)
            <input name="ram" type="number" min={0} defaultValue={query.ram ?? ""} className={fieldClass} inputMode="numeric" />
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Storage (GB)
            <input name="storage" type="number" min={0} defaultValue={query.storage ?? ""} className={fieldClass} inputMode="numeric" />
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Network
            <select name="network" defaultValue={query.network === "G5" ? "5g" : query.network === "G4" ? "4g" : ""} className={fieldClass}>
              <option value="">Any</option>
              <option value="4g">4G</option>
              <option value="5g">5G</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Display
            <select name="display" defaultValue={query.display ?? ""} className={fieldClass}>
              <option value="">Any</option>
              <option value="under6">Under 6 in</option>
              <option value="6to65">6 to 6.5 in</option>
              <option value="over65">Over 6.5 in</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Battery
            <select name="battery" defaultValue={query.battery ?? ""} className={fieldClass}>
              <option value="">Any</option>
              <option value="under4000">Under 4000 mAh</option>
              <option value="4000to5000">4000 to 5000 mAh</option>
              <option value="over5000">Over 5000 mAh</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Chipset
            <select name="chipset" defaultValue={query.chipset ?? ""} className={fieldClass}>
              <option value="">Any</option>
              {result.chipsets.map((chipset) => (
                <option key={chipset} value={chipset}>
                  {chipset}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Availability
            <select name="availability" defaultValue={query.availability ?? ""} className={fieldClass}>
              <option value="">Any</option>
              <option value="in_stock">In stock</option>
              <option value="preorder">Preorder</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted-foreground">
            Sort
            <select name="sort" defaultValue={query.sort} className={fieldClass}>
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price, low to high</option>
              <option value="price_desc">Price, high to low</option>
              <option value="saving">Biggest saving</option>
            </select>
          </label>
          <button type="submit" className={cn(buttonVariants({ variant: "default" }), "h-11")}>
            Apply
          </button>
          {filtered ? (
            <Link href={clearHref} className="text-center text-body-sm font-semibold text-primary">
              Clear filters
            </Link>
          ) : null}
        </form>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {result.products.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-6">
              <p className="text-body text-foreground">No phones match these filters.</p>
              <Link href={clearHref} className={cn(buttonVariants({ variant: "outline" }))}>
                Clear filters
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {result.products.map((product) => (
                <li key={product.id} className="min-w-0">
                  <ProductCard product={product} compareEnabled={compareEnabled} />
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 ? (
            <nav className="flex flex-wrap items-center gap-2" aria-label="Pages">
              {page < pageCount ? (
                <Link href={`${path}${toListingSearch(linkQuery, page + 1)}`} className={cn(buttonVariants({ variant: "outline" }), "lg:hidden")}>
                  Load more
                </Link>
              ) : null}
              <ol className="hidden flex-wrap gap-2 lg:flex">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <li key={number}>
                    <Link
                      href={`${path}${toListingSearch(linkQuery, number)}`}
                      aria-current={number === page ? "page" : undefined}
                      className={cn(
                        buttonVariants({ variant: number === page ? "default" : "outline", size: "sm" }),
                        "min-w-11"
                      )}
                    >
                      {number}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  )
}
