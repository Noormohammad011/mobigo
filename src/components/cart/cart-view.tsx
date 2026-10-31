"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useSyncExternalStore } from "react"

import { mergeGuestCartAction, removeCartLineAction, updateCartQuantityAction } from "@/app/cart/actions"
import { Price } from "@/components/commerce/price-block"
import { QuantityStepper } from "@/components/commerce/quantity-stepper"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatBDT } from "@/lib/format"
import { clearGuestCart, readGuestCart } from "@/lib/cart/guest-cart"
import type { CartLineView } from "@/lib/cart/get-cart"
import { cn } from "@/lib/utils"

const statusCopy: Record<CartLineView["status"], string> = {
  ok: "",
  price_changed: "Price changed since you added this.",
  low_stock: "Only a few left.",
  out_of_stock: "Out of stock.",
}

const subscribeGuestCart = (onChange: () => void) => {
  window.addEventListener("mobigo-cart-updated", onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener("mobigo-cart-updated", onChange)
    window.removeEventListener("storage", onChange)
  }
}

const SERVER_GUEST_CART: ReturnType<typeof readGuestCart> = []

let guestCartSnapshot: ReturnType<typeof readGuestCart> = SERVER_GUEST_CART
let guestCartKey = ""

const getGuestCartSnapshot = () => {
  const next = readGuestCart()
  const key = JSON.stringify(next)
  if (key === guestCartKey) return guestCartSnapshot
  guestCartKey = key
  guestCartSnapshot = next
  return guestCartSnapshot
}

export const CartView = ({ signedIn, serverLines }: { signedIn: boolean; serverLines: CartLineView[] }) => {
  const guestLines = useSyncExternalStore(subscribeGuestCart, getGuestCartSnapshot, () => SERVER_GUEST_CART)

  useEffect(() => {
    if (!signedIn) return
    const pending = readGuestCart()
    if (pending.length === 0) return
    void mergeGuestCartAction(pending).then(() => {
      clearGuestCart()
      window.location.reload()
    })
  }, [signedIn])

  const lines = signedIn ? serverLines : guestLines

  const subtotal = signedIn
    ? serverLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
    : guestLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)

  if (lines.length === 0) {
    return (
      <div className="page-container flex flex-col gap-4 py-10">
        <h1 className="font-display text-h1 text-foreground">Your cart</h1>
        <p className="text-body text-muted-foreground">Your cart is empty.</p>
        <Link href="/phones" className={cn(buttonVariants({ variant: "default" }), "w-fit")}>
          Browse phones
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container flex flex-col gap-6 py-6 lg:py-10">
      <h1 className="font-display text-h1 text-foreground">Your cart</h1>
      <ul className="flex flex-col gap-4">
        {signedIn
          ? serverLines.map((line) => (
              <li key={line.variantId} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-white">
                  {line.imageUrl ? (
                    <Image src={line.imageUrl} alt="" width={80} height={80} unoptimized={line.imageUrl.endsWith(".svg")} className="size-full object-contain" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/phones/${line.productSlug}`} className="font-semibold text-foreground hover:text-primary">
                    {line.productName}
                  </Link>
                  <p className="text-body-sm text-muted-foreground">{line.variantLabel}</p>
                  <Price price={line.unitPrice} compareAtPrice={line.livePrice !== line.unitPrice ? line.livePrice : null} className="mt-2" />
                  {line.status !== "ok" ? <p className="mt-1 text-body-sm text-danger-text">{statusCopy[line.status]}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <QuantityStepper
                      value={line.quantity}
                      onValueChange={(value) => void updateCartQuantityAction(line.variantId, value)}
                      stock={line.maxQuantity}
                      maxPerOrder={line.maxQuantity}
                    />
                    <button type="button" className="text-body-sm text-link underline" onClick={() => void removeCartLineAction(line.variantId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))
          : guestLines.map((line) => (
              <li key={line.variantId} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-white">
                  {line.imageUrl ? (
                    <Image src={line.imageUrl} alt="" width={80} height={80} unoptimized={line.imageUrl.endsWith(".svg")} className="size-full object-contain" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  {line.productSlug ? (
                    <Link href={`/phones/${line.productSlug}`} className="font-semibold text-foreground hover:text-primary">
                      {line.productName ?? "Phone"}
                    </Link>
                  ) : (
                    <p className="font-semibold text-foreground">{line.productName ?? "Phone"}</p>
                  )}
                  {line.variantLabel ? <p className="text-body-sm text-muted-foreground">{line.variantLabel}</p> : null}
                  <Price price={line.unitPrice} className="mt-2" />
                  <p className="mt-1 text-body-sm text-muted-foreground">Qty {line.quantity}</p>
                </div>
              </li>
            ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="flex justify-between text-body font-semibold text-foreground">
          <span>Subtotal</span>
          <span className="font-price">{formatBDT(subtotal)}</span>
        </p>
        {!signedIn ? (
          <Link href="/auth/login?next=/cart" className={cn(buttonVariants({ variant: "default" }), "mt-2")}>
            Sign in to save your cart
          </Link>
        ) : (
          <Button type="button" disabled className="mt-2">
            Checkout comes next
          </Button>
        )}
      </div>
    </div>
  )
}
