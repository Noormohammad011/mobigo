import Image from "next/image"
import Link from "next/link"
import { ShoppingCartIcon } from "lucide-react"

import { WishlistHeart } from "@/components/wishlist/wishlist-heart"
import { Price } from "@/components/commerce/price-block"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import type { ProductCardData } from "@/lib/queries/home"
import { cn } from "@/lib/utils"

/**
 * ProductCard — DESIGN_SYSTEM §7.4, PRD C-1…C-3.
 * The product name is the card's main link and its ::after covers the whole card, so
 * the card is one large tap target; the two actions sit above it as separate links.
 */
export function ProductCard({
  product: p,
  priority = false,
  className,
}: {
  product: ProductCardData
  /** Eager-load the image (use only for cards in the first viewport). */
  priority?: boolean
  className?: string
}) {
  const href = `/phones/${p.slug}`
  const soldOut = !p.inStock && !p.isPreorder

  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-xs transition-shadow duration-150 ease-brand lg:p-4 lg:hover:shadow-md",
        className
      )}
    >
      <div className="relative">
        <div className="pointer-events-none absolute top-0 right-0 z-20">
          <WishlistHeart productId={p.id} productSlug={p.slug} initialSaved={false} className="pointer-events-auto size-9 border-0 bg-card/90" />
        </div>
        <div className="pointer-events-none absolute top-0 left-0 z-10 flex flex-wrap gap-1">
          {p.is5g && <Badge variant="5g">5G</Badge>}
          {p.isNew && <Badge variant="new">NEW</Badge>}
          {p.isPreorder && <Badge variant="preorder">Pre-order</Badge>}
          {soldOut && <Badge variant="out">Out of stock</Badge>}
        </div>
        <div className="aspect-square overflow-hidden rounded-sm bg-white">
          {p.image ? (
            <Image
              src={p.image.url}
              alt={p.image.alt}
              width={400}
              height={400}
              priority={priority}
              unoptimized={p.image.url.endsWith(".svg")}
              sizes="(min-width: 1280px) 220px, (min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw"
              className={cn(
                "size-full object-contain transition-transform duration-250 ease-brand lg:group-hover/card:scale-[1.03]",
                soldOut && "opacity-60"
              )}
            />
          ) : (
            <div className="size-full bg-skeleton" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-2 min-h-[2lh] font-sans text-body-sm font-semibold text-foreground">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
          >
            {p.name}
          </Link>
        </h3>
        <Price price={p.price} compareAtPrice={p.compareAtPrice} from={p.from} />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        {soldOut ? (
          <Link href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>
            View details
          </Link>
        ) : (
          <>
            <Link href={`${href}#buy`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>
              {p.isPreorder ? "Pre-order" : "Buy Now"}
            </Link>
            <Link
              href={`${href}#buy`}
              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
              aria-label={`Choose options and add ${p.name} to cart`}
            >
              <ShoppingCartIcon aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
    </article>
  )
}
