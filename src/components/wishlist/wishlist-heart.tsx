"use client"

import { HeartIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { toggleWishlistAction } from "@/app/wishlist/actions"
import { cn } from "@/lib/utils"

export const WishlistHeart = ({
  productId,
  productSlug,
  initialSaved,
  className,
}: {
  productId: string
  productSlug: string
  initialSaved: boolean
  className?: string
}) => {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleWishlistAction(productId)
      if (!result.ok && result.reason === "guest") {
        router.push(`/auth/login?next=${encodeURIComponent(`/phones/${productSlug}`)}`)
        return
      }
      if (result.ok) setSaved(result.saved)
    })
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      disabled={pending}
      onClick={handleClick}
      className={cn(
        "relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-muted",
        className
      )}
    >
      <HeartIcon className={cn("size-5", saved && "fill-primary text-primary")} aria-hidden="true" />
    </button>
  )
}
