import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * DESIGN_SYSTEM §7.2: 44px white pill with a round primary submit inside.
 * A plain GET form, so search works before hydration and without JS.
 * Live suggestions (PRD G-5) layer on top in M1.
 */
export function SearchBar({ id, className }: { id: string; className?: string }) {
  return (
    <form action="/search" role="search" className={cn("relative flex items-center", className)}>
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
        className="h-11 w-full min-w-0 rounded-full border border-transparent bg-background pr-12 dark:border-ink-700 dark:bg-ink-900 pl-4 text-body-sm text-foreground transition-shadow duration-150 ease-brand outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-primary-400 [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 ease-brand outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
      >
        <SearchIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </form>
  )
}
