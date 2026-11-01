"use client"

import { SearchIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useId, useRef, useState } from "react"

import { setCompareSlugAtSlot } from "@/lib/compare/compare-list"
import { formatBDT } from "@/lib/format"
import { cn } from "@/lib/utils"

type Suggestion = { id: string; slug: string; name: string; price: number; imageUrl: string | null }

export const CompareSlotSearch = ({
  slotIndex,
  excludeSlugs,
  className,
}: {
  slotIndex: number
  excludeSlugs: string[]
  className?: string
}) => {
  const inputId = useId()
  const listId = useId()
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setItems([])
      return
    }
    timer.current = setTimeout(() => {
      void fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then((body: Suggestion[]) =>
          setItems(body.filter((item) => !excludeSlugs.includes(item.slug)))
        )
        .catch(() => setItems([]))
    }, 250)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query, excludeSlugs.join(",")])

  const handlePick = (item: Suggestion) => {
    setCompareSlugAtSlot(slotIndex, item.slug, item.id)
    setQuery("")
    setItems([])
    setOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">
        Search phone for compare slot {slotIndex + 1}
      </label>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        autoComplete="off"
        placeholder="Search…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && items.length > 0}
        aria-controls={items.length > 0 ? listId : undefined}
        className="h-10 w-full rounded-full border border-border bg-background pr-3 pl-9 text-body-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {open && items.length > 0 ? (
        <ul
          id={listId}
          aria-label="Phone suggestions"
          className="absolute top-full z-dropdown mt-1 max-h-56 w-full min-w-[220px] overflow-auto rounded-lg border border-border bg-card py-1 shadow-md"
        >
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-2 text-left outline-none hover:bg-muted focus-visible:bg-muted"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handlePick(item)}
              >
                <div className="relative size-9 shrink-0 overflow-hidden rounded-sm bg-white">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized={item.imageUrl.endsWith(".svg")}
                      className="size-full object-contain"
                    />
                  ) : null}
                </div>
                <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-foreground">{item.name}</span>
                <span className="font-price shrink-0 text-caption font-semibold text-foreground">{formatBDT(item.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
