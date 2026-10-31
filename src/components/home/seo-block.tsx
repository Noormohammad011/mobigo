import { ChevronDownIcon } from "lucide-react"

/**
 * Collapsible SEO copy — PRD H-6. Native <details>: the text is in the server HTML
 * (indexable), works without JavaScript, and is keyboard accessible.
 */
export function SeoBlock() {
  return (
    <section aria-labelledby="about-mobigo">
      <details className="group rounded-lg border border-border bg-muted">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
          <h2 id="about-mobigo" className="text-h3">
            Buy official phones in Bangladesh at MobiGo
          </h2>
          <ChevronDownIcon
            className="size-5 shrink-0 text-muted-foreground transition-transform duration-250 ease-brand group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="flex max-w-3xl flex-col gap-3 px-4 pb-5 text-body-sm text-muted-foreground">
          <p>
            MobiGo sells new, official smartphones from Samsung, Apple, Xiaomi, OnePlus, realme, Google and more,
            with the brand&apos;s official warranty. Every price you see is the cash price, and you pay only when the
            phone reaches your door.
          </p>
          <p>
            Compare the latest 5G flagships, mid-range phones and budget picks under ৳20,000 by price, RAM, storage,
            battery and camera. Choose your color and storage, order in a minute, and we call you to confirm before
            we ship.
          </p>
          <p>
            Delivery inside Dhaka usually takes 1–2 days, and 2–5 days to the rest of Bangladesh. You can also visit
            our outlets to try a phone before you buy.
          </p>
        </div>
      </details>
    </section>
  )
}
