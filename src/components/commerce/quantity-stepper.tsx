"use client"

import { MinusIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** QuantityStepper (DESIGN_SYSTEM §7.9): 44px pill, − value +, min 1, max min(stock, 5). */
export function QuantityStepper({
  value,
  onValueChange,
  stock,
  maxPerOrder = 5,
  className,
}: {
  value: number
  onValueChange: (value: number) => void
  stock: number
  maxPerOrder?: number
  className?: string
}) {
  const max = Math.max(1, Math.min(stock, maxPerOrder))
  const btn =
    "grid size-11 place-items-center rounded-full text-foreground transition-colors duration-150 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4"
  return (
    <div
      role="group"
      aria-label="Quantity"
      className={cn("inline-flex h-11 items-center rounded-full border border-border-strong", className)}
    >
      <button type="button" className={btn} onClick={() => onValueChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <MinusIcon aria-hidden="true" />
      </button>
      <output aria-live="polite" className="font-price min-w-8 text-center text-body font-semibold">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onValueChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <PlusIcon aria-hidden="true" />
      </button>
    </div>
  )
}
