import { cn } from "@/lib/utils"

const pulse = "animate-pulse rounded-md bg-muted"

/** Placeholder while listing data and flags resolve. Deterministic only. */
export const PhoneListingFallback = ({
  title,
  intro,
  className,
}: {
  title?: string
  intro?: string
  className?: string
}) => (
  <div
    className={cn("page-container flex flex-col gap-6 py-6 lg:py-10", className)}
    aria-busy="true"
    aria-label="Loading phone listing"
  >
    <header className="flex flex-col gap-2">
      {title ? (
        <h1 className="font-display text-h1 text-foreground">{title}</h1>
      ) : (
        <div className={cn(pulse, "h-9 w-2/3 max-w-md")} />
      )}
      {intro ? (
        <p className="max-w-2xl text-body text-muted-foreground">{intro}</p>
      ) : (
        <div className={cn(pulse, "h-5 w-full max-w-2xl")} />
      )}
      <div className={cn(pulse, "h-4 w-28")} />
    </header>
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className={cn("flex flex-col gap-3 rounded-lg border border-border bg-card p-4 lg:w-64 lg:shrink-0")}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={cn(pulse, "h-11 w-full")} />
        ))}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={cn(pulse, "aspect-[3/4] w-full rounded-lg")} />
        ))}
      </div>
    </div>
  </div>
)
