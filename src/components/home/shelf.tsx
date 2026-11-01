"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { ChipRow, ChoiceChip, ChoiceChipGroup } from "@/components/commerce/chip"
import { ProductCard } from "@/components/commerce/product-card"
import { Button } from "@/components/ui/button"
import type { HomeShelf } from "@/lib/queries/home"

import { SectionHeader } from "./section-header"

const ALL = "__all"

/**
 * Shelf — DESIGN_SYSTEM §7.13, PRD H-4. Brand chips filter on the client; the track uses
 * scroll-snap with 2.2 / 3.2 / 5 cards visible, and prev/next buttons at ≥lg.
 */
export function Shelf({ shelf, compareEnabled = false }: { shelf: HomeShelf; compareEnabled?: boolean }) {
  const headingId = `shelf-${shelf.slug}`
  const track = useRef<HTMLUListElement>(null)
  const [brand, setBrand] = useState(ALL)
  const [edges, setEdges] = useState({ start: true, end: false })

  const brands = useMemo(() => [...new Set(shelf.products.map((p) => p.brandName))], [shelf.products])
  const products = brand === ALL ? shelf.products : shelf.products.filter((p) => p.brandName === brand)

  const updateEdges = () => {
    const el = track.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }

  useEffect(() => {
    track.current?.scrollTo({ left: 0 })
    updateEdges()
  }, [brand])

  const page = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <SectionHeader id={headingId} title={shelf.title} href={`/collections/${shelf.slug}`}>
        <div className="hidden gap-2 lg:flex">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            onClick={() => page(-1)}
            disabled={edges.start}
            aria-label={`Previous ${shelf.title}`}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            onClick={() => page(1)}
            disabled={edges.end}
            aria-label={`More ${shelf.title}`}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </SectionHeader>

      {brands.length > 1 && (
        <ChipRow>
          <ChoiceChipGroup
            aria-label={`Filter ${shelf.title} by brand`}
            value={brand}
            onValueChange={(v) => setBrand(v as string)}
            className="flex-nowrap"
          >
            <ChoiceChip value={ALL}>All</ChoiceChip>
            {brands.map((b) => (
              <ChoiceChip key={b} value={b}>
                {b}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
        </ChipRow>
      )}

      <p role="status" className="sr-only">
        {brand === ALL ? "" : `Showing ${products.length} ${brand} phones`}
      </p>

      <ul
        ref={track}
        onScroll={updateEdges}
        aria-label={brand === ALL ? shelf.title : `${shelf.title}: ${brand}`}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-2 md:-mx-6 md:scroll-px-6 md:px-6 lg:mx-0 lg:scroll-px-0 lg:gap-5 lg:px-0"
      >
        {products.map((p) => (
          <li
            key={p.id}
            className="shrink-0 basis-[calc((100%-1.5rem)/2.2)] snap-start md:basis-[calc((100%-2.25rem)/3.2)] lg:basis-[calc((100%-5rem)/5)]"
          >
            <ProductCard product={p} compareEnabled={compareEnabled} />
          </li>
        ))}
      </ul>
    </section>
  )
}
