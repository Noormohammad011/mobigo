import Image from "next/image"
import Link from "next/link"
import { ShoppingCartIcon } from "lucide-react"

import { CompareToggle } from "@/components/compare/compare-toggle"
import { WishlistHeart } from "@/components/wishlist/wishlist-heart"
import { Price } from "@/components/commerce/price-block"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import type { ProductCardData } from "@/lib/queries/home"
import { cn } from "@/lib/utils"

/**
 * ProductCard — DESIGN_SYSTEM §7.4, PRD C-1…C-3.
 * Flat at rest (border + tone step); shelf uses a single primary CTA.
 */
export function ProductCard({
  product: p,
  priority = false,
  className,
  compareEnabled = false,
  layout = "default",
}: {
  product: ProductCardData
  priority?: boolean
  className?: string
  compareEnabled?: boolean
  layout?: "default" | "shelf"
}) {
  const href = `/phones/${p.slug}`
  const soldOut = !p.inStock && !p.isPreorder
  const shelf = layout === "shelf"

  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col gap-2.5 overflow-hidden rounded-xl border border-border bg-card p-3 transition-colors duration-150 ease-brand hover:border-border-strong hover:bg-muted/25 sm:gap-3 lg:p-3.5",
        className
      )}
    >
      <div className="relative">
        <div className="pointer-events-none absolute top-1 right-1 z-20 flex flex-row gap-0.5">
          <WishlistHeart
            productId={p.id}
            productSlug={p.slug}
            initialSaved={false}
            className="pointer-events-auto size-8 border-0 bg-card/95 shadow-none"
          />
          {compareEnabled ? (
            <CompareToggle
              productId={p.id}
              slug={p.slug}
              className="pointer-events-auto size-8 border-0 bg-card/95 shadow-none"
            />
          ) : null}
        </div>
        <div className="pointer-events-none absolute top-1 left-1 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1">
          {p.is5g && <Badge variant="5g">5G</Badge>}
          {p.isNew && <Badge variant="new">NEW</Badge>}
          {p.isPreorder && <Badge variant="preorder">Pre-order</Badge>}
          {soldOut && <Badge variant="out">Out of stock</Badge>}
        </div>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted/50">
          {p.image ? (
            <Image
              src={p.image.url}
              alt={p.image.alt}
              width={400}
              height={400}
              priority={priority}
              unoptimized={p.image.url.endsWith(".svg")}
              sizes={
                shelf
                  ? "(min-width: 1024px) 33vw, (min-width: 640px) 31vw, 46vw"
                  : "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, min(100vw - 3rem, 420px)"
              }
              className={cn("relative size-full object-contain p-3 mix-blend-multiply sm:p-4", soldOut && "opacity-60")}
            />
          ) : (
            <div className="size-full bg-skeleton" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-0.5">
        <p className="text-caption font-medium text-muted-foreground">{p.brandName}</p>
        <h3 className="line-clamp-2 min-h-[2lh] font-sans text-body-sm font-semibold leading-snug text-foreground">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
          >
            {p.name}
          </Link>
        </h3>
        <Price price={p.price} compareAtPrice={p.compareAtPrice} from={p.from} className="mt-0.5" />
      </div>

      <div className="relative z-10 px-0.5 pb-0.5 pt-1">
        {soldOut ? (
          <Link
            href={href}
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "h-10 w-full rounded-full")}
          >
            View details
          </Link>
        ) : shelf ? (
          <Link
            href={`${href}#buy`}
            className={cn(buttonVariants({ variant: "default", size: "default" }), "h-10 w-full rounded-full font-semibold")}
          >
            {p.isPreorder ? "Pre-order" : "Buy now"}
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href={`${href}#buy`}
              className={cn(buttonVariants({ variant: "default", size: "default" }), "h-10 min-w-0 flex-1 rounded-full font-semibold")}
            >
              {p.isPreorder ? "Pre-order" : "Buy now"}
            </Link>
            <Link
              href={`${href}#buy`}
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-10 shrink-0 rounded-full")}
              aria-label={`Choose options and add ${p.name} to cart`}
            >
              <ShoppingCartIcon aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}
