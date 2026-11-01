import Link from "next/link"

import { ProductCard } from "@/components/commerce/product-card"
import { ListingFilterForm } from "@/components/listing/listing-filter-form"
import { buttonVariants } from "@/components/ui/button"
import { LISTING_PAGE_SIZE, listingHasFilters, toListingSearch, type ListingQuery } from "@/lib/listing-params"
import type { ListingResult } from "@/lib/queries/listing"
import { cn } from "@/lib/utils"

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
  const linkQuery = fixedBrand ? { ...query, brandSlugs: [] } : query
  const filtered = listingHasFilters(query, fixedBrand)

  return (
    <div className="page-container flex flex-col gap-6 py-6 lg:gap-8 lg:py-10">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="font-display text-h1 text-foreground">{title}</h1>
        <p className="text-body text-muted-foreground">{intro}</p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="lg:sticky lg:top-28 lg:w-72 lg:shrink-0 lg:self-start">
          <ListingFilterForm
            path={path}
            query={query}
            brands={result.brands}
            chipsets={result.chipsets}
            fixedBrand={fixedBrand}
            filtered={filtered}
            clearHref={clearHref}
            total={result.total}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <p className="text-body-sm text-foreground">
            <span className="font-semibold tabular-nums">{result.total}</span>
            <span className="text-muted-foreground"> phones</span>
          </p>

          {result.products.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-muted/20 p-6">
              <p className="text-body font-semibold text-foreground">No phones match these filters.</p>
              <p className="text-body-sm text-muted-foreground">Try widening the price range or clearing one spec.</p>
              <Link href={clearHref} className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
                Clear filters
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {result.products.map((product) => (
                <li key={product.id} className="min-w-0">
                  <ProductCard product={product} compareEnabled={compareEnabled} />
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 ? (
            <nav className="flex flex-wrap items-center gap-2 pt-2" aria-label="Pages">
              {page < pageCount ? (
                <Link href={`${path}${toListingSearch(linkQuery, page + 1)}`} className={cn(buttonVariants({ variant: "outline" }), "rounded-full lg:hidden")}>
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
                        "min-w-11 rounded-full"
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
