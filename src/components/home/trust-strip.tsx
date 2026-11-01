import { BadgeCheckIcon, BanknoteIcon, RefreshCwIcon, ShieldCheckIcon, TruckIcon } from "lucide-react"

const items = [
  { icon: ShieldCheckIcon, title: "Genuine Products", text: "100% original phones" },
  { icon: TruckIcon, title: "Fast Delivery", text: "1–2 days inside Dhaka" },
  { icon: BanknoteIcon, title: "Cash on Delivery", text: "Pay when it arrives" },
  { icon: BadgeCheckIcon, title: "Official Warranty", text: "Brand-backed service" },
  { icon: RefreshCwIcon, title: "Easy Exchange", text: "7-day exchange policy" },
]

/** TrustStrip — DESIGN_SYSTEM §7.15, PRD H-2. Scrolls on mobile, 5 equal columns at lg. */
export function TrustStrip() {
  return (
    <section aria-label="Why shop with MobiGo">
      <ul tabIndex={0} aria-label="Store guarantees" className="scrollbar-none outline-none focus-visible:ring-3 focus-visible:ring-ring/40 -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:px-0 lg:grid lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-border lg:rounded-xl lg:border lg:border-border lg:bg-card lg:py-5 lg:shadow-xs">
        {items.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex shrink-0 snap-start items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 lg:justify-center lg:rounded-none lg:border-0 lg:bg-transparent lg:px-4 lg:py-1"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground ring-4 ring-accent/60">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-body-sm font-semibold whitespace-nowrap text-foreground">{title}</span>
              <span className="text-caption whitespace-nowrap text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
