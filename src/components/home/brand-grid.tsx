import Image from "next/image"
import Link from "next/link"

import type { BrandTile } from "@/lib/queries/home"

import { SectionHeader } from "./section-header"

/** "Shop by Brand" — PRD H-3, DESIGN_SYSTEM §5 (monochrome logos on ink-100 tiles). */
export function BrandGrid({ brands }: { brands: BrandTile[] }) {
  if (brands.length === 0) return null
  return (
    <section aria-labelledby="shop-by-brand" className="flex flex-col gap-4">
      <SectionHeader id="shop-by-brand" title="Shop by Brand" href="/brands" linkLabel="All brands" />
      <ul className="grid grid-cols-3 gap-3 md:grid-cols-6 lg:gap-5">
        {brands.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/brands/${b.slug}`}
              className="surface-counter lift group/brand flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-ink-700 p-3 text-center outline-none hover:border-primary-600 focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {b.logoUrl ? (
                <Image src={b.logoUrl} alt="" width={96} height={32} className="h-8 w-auto brightness-0 invert" />
              ) : (
                <span className="font-display text-h3 font-extrabold tracking-[-0.02em] text-white">{b.name}</span>
              )}
              <span className="text-caption text-primary-100/70 transition-colors duration-150 group-hover/brand:text-primary-100">
                {b.logoUrl && <span className="sr-only">{b.name}, </span>}
                {b.phoneCount} {b.phoneCount === 1 ? "phone" : "phones"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
