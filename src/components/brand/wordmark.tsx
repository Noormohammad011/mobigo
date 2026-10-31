import { cn } from "@/lib/utils"

/** Placeholder wordmark (DESIGN_SYSTEM §1): "Mobi" inverse + "Go" primary-400, Jakarta 800. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-[22px] leading-none font-extrabold tracking-[-0.02em] text-header-foreground",
        className
      )}
    >
      Mobi<span className="text-primary-400">Go</span>
    </span>
  )
}
