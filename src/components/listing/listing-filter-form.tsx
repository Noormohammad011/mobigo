"use client"

import { ChevronDownIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useOptimistic, useState, useTransition } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { SelectField } from "@/components/ui/form-select"
import { Slider } from "@/components/ui/slider"
import {
  countActiveFilters,
  PRICE_SLIDER,
  RAM_OPTIONS_GB,
  STORAGE_OPTIONS_GB,
  toListingSearch,
  type Availability,
  type BatteryBand,
  type DisplayBand,
  type ListingQuery,
  type Network,
} from "@/lib/listing-params"
import type { ListingResult } from "@/lib/queries/listing"
import { cn } from "@/lib/utils"

type Option<T extends string | number> = { value: T; label: string }

const NETWORK_OPTIONS: Option<Network>[] = [
  { value: "G5", label: "5G" },
  { value: "G4", label: "4G" },
]
const DISPLAY_OPTIONS: Option<DisplayBand>[] = [
  { value: "under6", label: "Under 6 in" },
  { value: "6to65", label: "6 to 6.5 in" },
  { value: "over65", label: "Over 6.5 in" },
]
const BATTERY_OPTIONS: Option<BatteryBand>[] = [
  { value: "under4000", label: "Under 4000 mAh" },
  { value: "4000to5000", label: "4000 to 5000 mAh" },
  { value: "over5000", label: "Over 5000 mAh" },
]
const AVAILABILITY_OPTIONS: Option<Availability>[] = [
  { value: "in_stock", label: "In stock" },
  { value: "preorder", label: "Pre-order" },
]
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "saving", label: "Biggest saving" },
]
const BRANDS_COLLAPSED = 8

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

const formatBdt = (n: number) => `৳${n.toLocaleString("en-US")}`

/** Collapsible group. Native details: works without JavaScript and keeps keyboard support. */
function Group({
  title,
  activeCount = 0,
  defaultOpen = false,
  children,
}: {
  title: string
  activeCount?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details open={defaultOpen || activeCount > 0} className="group/filter border-t border-border first:border-t-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-5 py-3 outline-none select-none focus-visible:bg-muted [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
          {title}
          {activeCount > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-caption font-semibold text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform duration-150 group-open/filter:rotate-180"
        />
      </summary>
      <div className="px-5 pb-4">{children}</div>
    </details>
  )
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-body-sm transition-colors duration-150 hover:bg-muted",
        checked ? "font-semibold text-foreground" : "text-foreground/85"
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="size-[18px] rounded-[5px]" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </label>
  )
}

function CheckList<T extends string | number>({
  options,
  selected,
  onToggle,
}: {
  options: Option<T>[]
  selected: T[]
  onToggle: (value: T) => void
}) {
  return (
    <div className="-mx-2 flex flex-col">
      {options.map((o) => (
        <CheckRow key={o.value} label={o.label} checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} />
      ))}
    </div>
  )
}

/** Pill toggles for short numeric options (RAM, storage). */
function PillList({
  options,
  selected,
  onToggle,
  unit,
}: {
  options: readonly number[]
  selected: number[]
  onToggle: (value: number) => void
  unit: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((value) => {
        const on = selected.includes(value)
        const label = unit === "GB" && value >= 1024 ? `${value / 1024} TB` : `${value} ${unit}`
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(value)}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-full border px-3.5 text-caption font-semibold outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/40",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function PriceFilter({
  min,
  max,
  onCommit,
}: {
  min?: number
  max?: number
  onCommit: (min: number | undefined, max: number | undefined) => void
}) {
  const [range, setRange] = useState<[number, number]>([min ?? PRICE_SLIDER.min, max ?? PRICE_SLIDER.max])
  const [lowText, setLowText] = useState(min != null ? String(min) : "")
  const [highText, setHighText] = useState(max != null ? String(max) : "")

  const commit = (low: number, high: number) => {
    const lo = Math.max(PRICE_SLIDER.min, Math.min(low, high))
    const hi = Math.min(PRICE_SLIDER.max * 5, Math.max(low, high))
    onCommit(lo > PRICE_SLIDER.min ? lo : undefined, hi < PRICE_SLIDER.max ? hi : undefined)
  }

  const fromText = () => {
    const low = lowText.trim() === "" ? PRICE_SLIDER.min : Number(lowText)
    const high = highText.trim() === "" ? PRICE_SLIDER.max : Number(highText)
    if (!Number.isFinite(low) || !Number.isFinite(high) || low < 0 || high < 0) return
    setRange([Math.min(low, high, PRICE_SLIDER.max), Math.min(Math.max(low, high), PRICE_SLIDER.max)])
    commit(Math.round(low), Math.round(high))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1.5 pt-2">
        <Slider
          min={PRICE_SLIDER.min}
          max={PRICE_SLIDER.max}
          step={PRICE_SLIDER.step}
          value={range}
          aria-label="Price range"
          onValueChange={(v) => {
            const next = v as number[]
            setRange([next[0], next[1]])
            setLowText(next[0] > PRICE_SLIDER.min ? String(next[0]) : "")
            setHighText(next[1] < PRICE_SLIDER.max ? String(next[1]) : "")
          }}
          onValueCommitted={(v) => {
            const next = v as number[]
            commit(next[0], next[1])
          }}
        />
        <p className="mt-3 flex justify-between text-caption font-semibold text-foreground tabular-nums">
          <span>{formatBdt(range[0])}</span>
          <span>{range[1] >= PRICE_SLIDER.max ? `${formatBdt(range[1])}+` : formatBdt(range[1])}</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Min", value: lowText, set: setLowText, placeholder: "0" },
          { label: "Max", value: highText, set: setHighText, placeholder: "Any" },
        ].map((f) => (
          <label key={f.label} className="flex flex-col gap-1">
            <span className="text-caption text-muted-foreground">{f.label} (BDT)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={f.value}
              placeholder={f.placeholder}
              onChange={(e) => f.set(e.target.value)}
              onBlur={fromText}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  fromText()
                }
              }}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-body-sm text-foreground tabular-nums outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

export function ListingFilterForm({
  path,
  query,
  brands,
  chipsets,
  fixedBrand,
  total,
}: {
  path: string
  query: ListingQuery
  brands: ListingResult["brands"]
  chipsets: string[]
  fixedBrand: boolean
  filtered: boolean
  clearHref: string
  /** Matching phones for the current filters, shown on the mobile close button. */
  total: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [q, setQ] = useOptimistic(query)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)

  const apply = (patch: Partial<ListingQuery>) => {
    const next: ListingQuery = { ...q, ...patch, page: 1 }
    const href = `${path}${toListingSearch(fixedBrand ? { ...next, brandSlugs: [] } : next)}`
    startTransition(() => {
      setQ(next)
      router.replace(href, { scroll: false })
    })
  }

  const active = countActiveFilters(q, fixedBrand)
  const reset = () =>
    apply({
      brandSlugs: fixedBrand ? q.brandSlugs : [],
      minPrice: undefined,
      maxPrice: undefined,
      rams: [],
      storages: [],
      networks: [],
      displays: [],
      batteries: [],
      chipsets: [],
      availabilities: [],
    })

  const brandName = (slug: string) => brands.find((b) => b.slug === slug)?.name ?? slug
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(fixedBrand
      ? []
      : q.brandSlugs.map((s) => ({ key: `b-${s}`, label: brandName(s), remove: () => apply({ brandSlugs: q.brandSlugs.filter((v) => v !== s) }) }))),
    ...(q.minPrice != null || q.maxPrice != null
      ? [
          {
            key: "price",
            label: `${formatBdt(q.minPrice ?? 0)} to ${q.maxPrice != null ? formatBdt(q.maxPrice) : "any"}`,
            remove: () => apply({ minPrice: undefined, maxPrice: undefined }),
          },
        ]
      : []),
    ...q.rams.map((v) => ({ key: `r-${v}`, label: `${v} GB RAM`, remove: () => apply({ rams: q.rams.filter((x) => x !== v) }) })),
    ...q.storages.map((v) => ({ key: `s-${v}`, label: `${v >= 1024 ? v / 1024 + " TB" : v + " GB"} storage`, remove: () => apply({ storages: q.storages.filter((x) => x !== v) }) })),
    ...q.networks.map((v) => ({ key: `n-${v}`, label: v === "G5" ? "5G" : "4G", remove: () => apply({ networks: q.networks.filter((x) => x !== v) }) })),
    ...q.displays.map((v) => ({ key: `d-${v}`, label: DISPLAY_OPTIONS.find((o) => o.value === v)?.label ?? v, remove: () => apply({ displays: q.displays.filter((x) => x !== v) }) })),
    ...q.batteries.map((v) => ({ key: `bt-${v}`, label: BATTERY_OPTIONS.find((o) => o.value === v)?.label ?? v, remove: () => apply({ batteries: q.batteries.filter((x) => x !== v) }) })),
    ...q.chipsets.map((v) => ({ key: `c-${v}`, label: v, remove: () => apply({ chipsets: q.chipsets.filter((x) => x !== v) }) })),
    ...q.availabilities.map((v) => ({ key: `a-${v}`, label: AVAILABILITY_OPTIONS.find((o) => o.value === v)?.label ?? v, remove: () => apply({ availabilities: q.availabilities.filter((x) => x !== v) }) })),
  ]

  const brandOptions = brands.map((b) => ({ value: b.slug, label: b.name }))
  const visibleBrands =
    showAllBrands || brandOptions.length <= BRANDS_COLLAPSED
      ? brandOptions
      : [
          ...brandOptions.filter((b, i) => i < BRANDS_COLLAPSED || q.brandSlugs.includes(b.value)),
        ]

  return (
    <div>
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="listing-filters"
        onClick={() => setMobileOpen((v) => !v)}
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-full border border-border bg-card px-5 text-body-sm font-semibold text-foreground shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/40 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontalIcon aria-hidden="true" className="size-4 text-primary" />
          Filters
          {active > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-caption text-primary-foreground tabular-nums">
              {active}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon aria-hidden="true" className={cn("size-4 transition-transform duration-150", mobileOpen && "rotate-180")} />
      </button>

      <section
        id="listing-filters"
        aria-label="Filters"
        aria-busy={pending}
        className={cn(
          "mt-3 flex max-h-[min(100dvh-6rem,40rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs lg:mt-0 lg:max-h-[calc(100dvh-7.25rem)]",
          mobileOpen ? "flex" : "hidden lg:flex"
        )}
      >
        <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontalIcon aria-hidden="true" className="size-4 text-primary" />
            <h2 className="font-display text-body font-semibold text-foreground">Filters</h2>
            {pending ? (
              <span role="status" className="text-caption text-muted-foreground">
                Updating…
              </span>
            ) : null}
          </div>
          {active > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer rounded-md px-1 text-caption font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              Reset all
            </button>
          ) : null}
        </div>

        {chips.length > 0 ? (
          <ul className="flex flex-wrap gap-2 border-b border-border px-5 py-3" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={c.remove}
                  aria-label={`Remove filter ${c.label}`}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-accent pr-2 pl-3 text-caption font-semibold text-accent-foreground outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  {c.label}
                  <XIcon aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="shrink-0 border-b border-border px-5 py-4">
          <span className="mb-1.5 block text-caption font-medium text-muted-foreground">Sort by</span>
          <SelectField
            value={q.sort}
            aria-label="Sort by"
            options={SORT_OPTIONS}
            onValueChange={(v) => apply({ sort: v as ListingQuery["sort"] })}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
        {!fixedBrand ? (
          <Group title="Brand" defaultOpen activeCount={q.brandSlugs.length}>
            <CheckList
              options={visibleBrands}
              selected={q.brandSlugs}
              onToggle={(v) => apply({ brandSlugs: toggle(q.brandSlugs, v) })}
            />
            {brandOptions.length > BRANDS_COLLAPSED ? (
              <button
                type="button"
                onClick={() => setShowAllBrands((v) => !v)}
                className="mt-1 cursor-pointer rounded-md text-caption font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {showAllBrands ? "Show fewer" : `Show all ${brandOptions.length} brands`}
              </button>
            ) : null}
          </Group>
        ) : null}

        <Group title="Price" defaultOpen activeCount={q.minPrice != null || q.maxPrice != null ? 1 : 0}>
          <PriceFilter
            key={`${q.minPrice ?? ""}-${q.maxPrice ?? ""}`}
            min={q.minPrice}
            max={q.maxPrice}
            onCommit={(min, max) => apply({ minPrice: min, maxPrice: max })}
          />
        </Group>

        <Group title="Availability" defaultOpen activeCount={q.availabilities.length}>
          <CheckList
            options={AVAILABILITY_OPTIONS}
            selected={q.availabilities}
            onToggle={(v) => apply({ availabilities: toggle(q.availabilities, v) })}
          />
        </Group>

        <Group title="Network" activeCount={q.networks.length} defaultOpen>
          <CheckList options={NETWORK_OPTIONS} selected={q.networks} onToggle={(v) => apply({ networks: toggle(q.networks, v) })} />
        </Group>

        <Group title="RAM" activeCount={q.rams.length} defaultOpen>
          <PillList options={RAM_OPTIONS_GB} selected={q.rams} unit="GB" onToggle={(v) => apply({ rams: toggle(q.rams, v) })} />
        </Group>

        <Group title="Storage" activeCount={q.storages.length}>
          <PillList options={STORAGE_OPTIONS_GB} selected={q.storages} unit="GB" onToggle={(v) => apply({ storages: toggle(q.storages, v) })} />
        </Group>

        <Group title="Display size" activeCount={q.displays.length}>
          <CheckList options={DISPLAY_OPTIONS} selected={q.displays} onToggle={(v) => apply({ displays: toggle(q.displays, v) })} />
        </Group>

        <Group title="Battery" activeCount={q.batteries.length}>
          <CheckList options={BATTERY_OPTIONS} selected={q.batteries} onToggle={(v) => apply({ batteries: toggle(q.batteries, v) })} />
        </Group>

        {chipsets.length > 0 ? (
          <Group title="Chipset" activeCount={q.chipsets.length}>
            <CheckList
              options={chipsets.map((c) => ({ value: c, label: c }))}
              selected={q.chipsets}
              onToggle={(v) => apply({ chipsets: toggle(q.chipsets, v) })}
            />
          </Group>
        ) : null}
        </div>

        <div className="sticky bottom-0 mt-auto shrink-0 border-t border-border bg-card p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="h-12 w-full cursor-pointer rounded-full bg-primary text-body-sm font-semibold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Show {total} {total === 1 ? "phone" : "phones"}
          </button>
        </div>
      </section>
    </div>
  )
}
