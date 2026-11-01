"use client"

import { ChevronDownIcon, ChevronUpIcon, SearchIcon, XIcon } from "lucide-react"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"

import { saveCollectionItemsAction } from "@/app/admin/merchandising/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatBDT } from "@/lib/format"

type ItemRow = {
  productId: string
  name: string
  brandName: string
  minPrice: number
}

type Suggestion = { id: string; slug: string; name: string; price: number }

export const CollectionItemsEditor = ({
  collectionId,
  initialItems,
}: {
  collectionId: string
  initialItems: ItemRow[]
}) => {
  const [items, setItems] = useState<ItemRow[]>(initialItems)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [state, action, pending] = useActionState(saveCollectionItemsAction, undefined)

  const excludeIds = useMemo(() => new Set(items.map((item) => item.productId)), [items])
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }
    searchTimer.current = setTimeout(() => {
      void fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then((body: Suggestion[]) => setSuggestions(body.filter((hit) => !excludeIds.has(hit.id))))
        .catch(() => setSuggestions([]))
    }, 250)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [query, excludeIds])

  const handleQueryChange = (value: string) => {
    setQuery(value)
  }

  const handleAdd = (hit: Suggestion) => {
    setItems((current) => [
      ...current,
      { productId: hit.id, name: hit.name, brandName: "", minPrice: hit.price },
    ])
    setQuery("")
    setSuggestions([])
  }

  const handleRemove = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    setItems((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      const temp = next[index]
      next[index] = next[target]
      next[target] = temp
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <div>
        <h2 className="font-display text-h3 text-foreground">Shelf products</h2>
        <p className="text-body-sm text-muted-foreground">Order is top to bottom on the home shelf and collection page.</p>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Search phones to add…"
          className="pl-9"
          aria-label="Search phones to add to collection"
        />
        {suggestions.length > 0 ? (
          <ul className="absolute top-full z-dropdown mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-md">
            {suggestions.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-body-sm hover:bg-muted"
                  onClick={() => handleAdd(hit)}
                >
                  <span className="truncate font-medium">{hit.name}</span>
                  <span className="font-price shrink-0 text-caption">{formatBDT(hit.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-body-sm text-muted-foreground">No products yet. Search above to add phones.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={item.productId}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <span className="w-6 shrink-0 text-caption text-muted-foreground">{index + 1}</span>
              <span className="min-w-0 flex-1 text-body-sm font-medium text-foreground">{item.name}</span>
              {item.brandName ? (
                <span className="text-caption text-muted-foreground">{item.brandName}</span>
              ) : null}
              <span className="font-price text-caption">{formatBDT(item.minPrice)}</span>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${item.name} up`}
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                >
                  <ChevronUpIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${item.name} down`}
                  disabled={index === items.length - 1}
                  onClick={() => handleMove(index, 1)}
                >
                  <ChevronDownIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => handleRemove(item.productId)}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? <p className="text-body-sm text-success-text">Shelf order saved.</p> : null}

      <form action={action}>
        <input type="hidden" name="collectionId" value={collectionId} />
        <input type="hidden" name="productIdsJson" value={JSON.stringify(items.map((item) => item.productId))} />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving order…" : "Save shelf order"}
        </Button>
      </form>
    </div>
  )
}
