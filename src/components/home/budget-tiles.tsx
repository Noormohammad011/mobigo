import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { SectionHeader } from "./section-header"

/** Price bands shared with the header's budget shortcuts (same query params). */
const bands = [
  { label: "Under ৳15k", hint: "Everyday essentials", query: "maxPrice=15000" },
  { label: "৳15k – 30k", hint: "Best value", query: "minPrice=15000&maxPrice=30000" },
  { label: "৳30k – 60k", hint: "Mid-range power", query: "minPrice=30000&maxPrice=60000" },
  { label: "৳60k – 100k", hint: "Premium picks", query: "minPrice=60000&maxPrice=100000" },
  { label: "৳100k+", hint: "Flagships", query: "minPrice=100000" },
]

/** "Shop by Budget" — PRD H-5. */
export function BudgetTiles() {
  return (
    <section aria-labelledby="shop-by-budget" className="flex flex-col gap-4">
      <SectionHeader id="shop-by-budget" title="Shop by Budget" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {bands.map((b, i) => (
          <li key={b.query} className={i === bands.length - 1 ? "col-span-2 sm:col-span-1" : undefined}>
            <Link
              href={`/phones?${b.query}`}
              className="group flex h-full flex-col gap-1 rounded-lg border border-border bg-card p-4 outline-none transition-[border-color,box-shadow] duration-150 ease-brand hover:border-primary hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="font-price text-price text-foreground">{b.label}</span>
              <span className="flex items-center justify-between gap-2 text-caption text-muted-foreground">
                {b.hint}
                <ArrowRightIcon
                  className="size-4 text-primary transition-transform duration-150 ease-brand group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
