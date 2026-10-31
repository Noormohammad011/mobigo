import { Badge } from "@/components/ui/badge"
import { formatBDT } from "@/lib/format"
import { cn } from "@/lib/utils"

/** SavePill (DESIGN_SYSTEM §7.5): absolute savings, "৳501 OFF". Renders nothing for 0. */
export function SavePill({ amount, className }: { amount: number; className?: string }) {
  if (amount <= 0) return null
  return (
    <Badge variant="save" className={cn("font-price", className)}>
      {formatBDT(amount)} OFF
    </Badge>
  )
}
