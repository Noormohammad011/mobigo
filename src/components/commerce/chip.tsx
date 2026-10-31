"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { Toggle } from "@base-ui/react/toggle"
import { cva } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Chip (DESIGN_SYSTEM §7.6): 36px pill, 1px border, body-sm. 44px hit area via ::after. */
const chipBase = cva(
  "relative inline-flex h-9 shrink-0 cursor-pointer snap-start items-center gap-2 rounded-full border border-border bg-background px-3.5 text-body-sm font-medium whitespace-nowrap text-foreground transition-colors duration-150 ease-brand outline-none select-none after:absolute after:-inset-y-1 after:inset-x-0 hover:border-border-strong focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-1 data-checked:border-[1.5px] data-checked:border-primary data-checked:bg-primary-50 data-checked:text-primary-700 data-pressed:border-[1.5px] data-pressed:border-primary data-pressed:bg-primary-50 data-pressed:text-primary-700 data-disabled:cursor-not-allowed data-disabled:opacity-40"
)

/** Horizontal chip row: scroll-snap, edge fade, no scrollbar (§7.6). */
export function ChipRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("fade-x scrollbar-none -mx-4 flex snap-x gap-2 overflow-x-auto px-4 py-1", className)}
      {...props}
    />
  )
}

/** Filter chip: a toggle (aria-pressed). Pass `onRemove` to render an applied-filter chip. */
export function FilterChip({
  className,
  children,
  onRemove,
  ...props
}: Toggle.Props & { onRemove?: () => void }) {
  if (onRemove) {
    return (
      <button type="button" onClick={onRemove} className={cn(chipBase(), "pr-2.5", className)}>
        {children}
        <XIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Remove filter</span>
      </button>
    )
  }
  return (
    <Toggle className={cn(chipBase(), className)} {...props}>
      {children}
    </Toggle>
  )
}

/** Variant selector group: radio-group semantics with arrow-key navigation (§8). */
export function ChoiceChipGroup({ className, ...props }: RadioGroup.Props) {
  return <RadioGroup className={cn("flex flex-wrap gap-2", className)} {...props} />
}

/**
 * One variant option. `unavailable` keeps it focusable and selectable (the shopper can
 * still switch to it) but shows the strike style and announces why (§7.6).
 */
export function ChoiceChip({
  className,
  children,
  unavailable,
  unavailableLabel = "Not available in this color",
  swatch,
  ...props
}: Radio.Root.Props & { unavailable?: boolean; unavailableLabel?: string; swatch?: string }) {
  return (
    <Radio.Root
      className={cn(
        chipBase(),
        unavailable &&
          "border-dashed bg-ink-100 text-ink-500 bg-[linear-gradient(to_top_right,transparent_calc(50%-0.75px),var(--color-ink-300)_50%,transparent_calc(50%+0.75px))] data-checked:bg-ink-100",
        className
      )}
      title={unavailable ? unavailableLabel : undefined}
      {...props}
    >
      {swatch && (
        <span
          aria-hidden="true"
          className="size-5 rounded-full border border-black/10 ring-offset-2 ring-offset-background in-data-checked:ring-2 in-data-checked:ring-primary"
          style={{ backgroundColor: swatch }}
        />
      )}
      {children}
      {unavailable && <span className="sr-only">({unavailableLabel})</span>}
    </Radio.Root>
  )
}
