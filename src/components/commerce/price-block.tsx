import { SavePill } from "@/components/commerce/save-pill"
import { formatBDT } from "@/lib/format"
import { cn } from "@/lib/utils"

type PriceProps = {
  price: number
  compareAtPrice?: number | null
  /** "From" prefix when variants differ in price (§7.4). */
  from?: boolean
  className?: string
}

/** Card price (§7.4): price, then struck compare-at price + SavePill. */
export function Price({ price, compareAtPrice, from, className }: PriceProps) {
  const saving = compareAtPrice ? compareAtPrice - price : 0
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <p className="font-price text-price text-foreground">
        {from && <span className="text-caption font-medium text-muted-foreground">From </span>}
        {formatBDT(price)}
      </p>
      {saving > 0 && (
        <p className="flex flex-wrap items-center gap-1.5">
          <s className="font-price text-caption text-muted-foreground">
            <span className="sr-only">Regular price </span>
            {formatBDT(compareAtPrice!)}
          </s>
          <SavePill amount={saving} />
        </p>
      )}
    </div>
  )
}

/** Product page price (§7.8). aria-live announces changes when the variant changes. */
export function PriceBlock({ price, compareAtPrice, className }: Omit<PriceProps, "from">) {
  const saving = compareAtPrice ? compareAtPrice - price : 0
  return (
    <div aria-live="polite" className={cn("flex flex-col gap-1", className)}>
      <p className="flex items-baseline gap-2">
        <span className="font-price text-price-lg text-foreground">{formatBDT(price)}</span>
        <span className="text-caption text-muted-foreground">(Cash price)</span>
      </p>
      {saving > 0 && (
        <p className="flex items-center gap-2">
          <s className="font-price text-body-sm text-muted-foreground">
            <span className="sr-only">Regular price </span>
            {formatBDT(compareAtPrice!)}
          </s>
          <SavePill amount={saving} />
        </p>
      )}
    </div>
  )
}
