import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import type { Metadata } from "next"

import { Price } from "@/components/commerce/price-block"
import { buttonVariants } from "@/components/ui/button"
import { requireUser } from "@/lib/auth/session"
import { assertFlag } from "@/lib/flags"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } }

const WishlistItems = async () => {
  await assertFlag("wishlist")
  const user = await requireUser("/account/wishlist")

  const items = await db.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      product: {
        select: {
          slug: true,
          name: true,
          minPrice: true,
          maxPrice: true,
          maxSaving: true,
          colors: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } } },
          },
        },
      },
    },
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-body text-muted-foreground">No saved phones yet.</p>
        <Link href="/phones" className={cn(buttonVariants({ variant: "default" }), "w-fit")}>
          Browse phones
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ product: p }) => {
        const image = p.colors[0]?.images[0]
        const compareAt = p.maxSaving > 0 ? p.minPrice + p.maxSaving : null
        return (
          <li key={p.slug}>
            <Link href={`/phones/${p.slug}`} className="flex gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-sm">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-white">
                {image ? (
                  <Image src={image.url} alt={image.alt} width={80} height={80} unoptimized={image.url.endsWith(".svg")} className="size-full object-contain" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{p.name}</p>
                <Price price={p.minPrice} compareAtPrice={compareAt} from={p.minPrice !== p.maxPrice} className="mt-1" />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function WishlistPage() {
  return (
    <div className="page-container max-w-2xl py-8">
      <h1 className="mb-2 font-display text-h1 text-foreground">Wishlist</h1>
      <p className="mb-6 text-body-sm text-muted-foreground">
        <Link href="/account" className="text-link underline">
          Account
        </Link>
      </p>
      <Suspense fallback={<p className="text-muted-foreground">Loading wishlist…</p>}>
        <WishlistItems />
      </Suspense>
    </div>
  )
}
