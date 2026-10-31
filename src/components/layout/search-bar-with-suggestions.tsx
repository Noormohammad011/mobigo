"use client"

import { SearchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"

import { formatBDT } from "@/lib/format"
import { cn } from "@/lib/utils"

type Suggestion = { id: string; slug: string; name: string; price: number; imageUrl: string | null }

export const SearchBarWithSuggestions = ({ id, className }: { id: string; className?: string }) => {
  const listId = useId()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) return
    timer.current = setTimeout(() => {
      void fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then((body: Suggestion[]) => setItems(body))
        .catch(() => setItems([]))
    }, 250)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <form action="/search" onSubmit={handleSubmit} className={cn("relative flex items-center", className)}>
      <label htmlFor={id} className="sr-only">
        Search phones and brands
      </label>
      <input
        id={id}
        name="q"
        type="search"
        required
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Search phones, brands…"
        value={query}
        onChange={(event) => {
          const value = event.target.value
          setQuery(value)
          if (value.trim().length < 2) setItems([])
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && items.length > 0}
        aria-controls={items.length > 0 ? listId : undefined}
        className="h-11 w-full min-w-0 rounded-full border border-transparent bg-background pr-12 pl-4 text-body-sm text-foreground transition-shadow duration-150 ease-brand outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-primary-400 [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 ease-brand outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
      >
        <SearchIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open && items.length > 0 ? (
        <ul
          id={listId}
          aria-label="Search suggestions"
          className="absolute top-full z-dropdown mt-2 max-h-80 w-full overflow-auto rounded-lg border border-border bg-card py-2 shadow-md"
        >
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/phones/${item.slug}`}
                className="flex items-center gap-3 px-3 py-2 outline-none hover:bg-muted focus-visible:bg-muted"
                onMouseDown={(event) => event.preventDefault()}
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-sm bg-white">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" width={40} height={40} unoptimized={item.imageUrl.endsWith(".svg")} className="size-full object-contain" />
                  ) : null}
                </div>
                <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-foreground">{item.name}</span>
                <span className="font-price text-body-sm font-semibold text-foreground">{formatBDT(item.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  )
}
