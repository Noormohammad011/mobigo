"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { BanknoteIcon, PhoneCallIcon } from "lucide-react"
import { toast } from "sonner"

import { addToCartAction } from "@/app/cart/actions"
import { PriceBlock } from "@/components/commerce/price-block"
import { QuantityStepper } from "@/components/commerce/quantity-stepper"
import { Badge } from "@/components/ui/badge"
import { CompareToggle } from "@/components/compare/compare-toggle"
import { WishlistHeart } from "@/components/wishlist/wishlist-heart"
import { Button } from "@/components/ui/button"
import { addGuestLine } from "@/lib/cart/guest-cart"
import type { ProductDetailPayload } from "@/lib/queries/product-detail"
import { quantityAllowed, type VariantAvailability } from "@/lib/stock-rule"
import { cn } from "@/lib/utils"

const storageLabel = (gb: number) => (gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`)

const pickVariant = (product: ProductDetailPayload, variantId: string | null) => {
  if (variantId) {
    const found = product.variants.find((variant) => variant.id === variantId)
    if (found) return found
  }
  return product.variants.find((variant) => product.availability[variant.id]?.reason === "ok" || product.availability[variant.id]?.reason === "preorder") ?? product.variants[0]
}

const comboActive = (product: ProductDetailPayload, colorId: string, ram: number, storage: number) =>
  product.variants.some((variant) => variant.colorId === colorId && variant.ramGb === ram && variant.storageGb === storage)

export const ProductPurchase = ({
  product,
  signedIn,
  wishlisted,
  compareEnabled = false,
}: {
  product: ProductDetailPayload
  signedIn: boolean
  wishlisted: boolean
  compareEnabled?: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [quantity, setQuantity] = useState(1)
  const [pendingAction, setPendingAction] = useState<"buy" | "cart" | null>(null)

  const selected = useMemo(() => pickVariant(product, searchParams.get("variant")), [product, searchParams])
  const availability: VariantAvailability | undefined = selected ? product.availability[selected.id] : undefined
  const color = product.colors.find((entry) => entry.id === selected?.colorId)
  const ramOptions = [...new Set(product.variants.map((variant) => variant.ramGb))].sort((a, b) => a - b)
  const storageOptions = [...new Set(product.variants.map((variant) => variant.storageGb))].sort((a, b) => a - b)

  const setVariant = (variantId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("variant", variantId)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const selectCombo = (colorId: string, ram: number, storage: number) => {
    const match = product.variants.find((variant) => variant.colorId === colorId && variant.ramGb === ram && variant.storageGb === storage)
    if (match) setVariant(match.id)
  }

  const canBuy = selected && availability && quantityAllowed(availability.reason, availability.maxQuantity, quantity)
  const busy = pending || pendingAction !== null

  /**
   * Adds the selected variant × quantity to the right cart (guest localStorage or
   * server). Returns true on success; on failure it tells the shopper why and
   * returns false, so callers never navigate on a failed add.
   */
  const addSelected = async (): Promise<boolean> => {
    if (!selected || !availability || !canBuy) return false
    const guestLine = {
      variantId: selected.id,
      quantity,
      unitPrice: selected.price,
      productName: product.name,
      productSlug: product.slug,
      variantLabel: `${storageLabel(selected.storageGb)} / ${selected.ramGb}GB RAM`,
      imageUrl: color?.images[0]?.url ?? null,
    }
    if (!signedIn) {
      addGuestLine(guestLine)
      return true
    }
    try {
      const result = await addToCartAction({ variantId: selected.id, quantity, unitPrice: selected.price })
      if (result.ok) return true
      if (result.reason === "guest") {
        // Session expired since the page loaded: keep the phone in the guest cart.
        addGuestLine(guestLine)
        return true
      }
      toast.error("Not enough stock for that quantity", {
        description: "Lower the quantity or pick another colour or storage.",
      })
      return false
    } catch {
      toast.error("Couldn't add this phone", {
        description: "Check your connection and try again.",
      })
      return false
    }
  }

  const handleBuyNow = () => {
    setPendingAction("buy")
    startTransition(async () => {
      const ok = await addSelected()
      if (ok) {
        router.push("/checkout")
      } else {
        setPendingAction(null)
      }
    })
  }

  const handleAddToCart = () => {
    setPendingAction("cart")
    startTransition(async () => {
      const ok = await addSelected()
      setPendingAction(null)
      if (!ok) return
      router.refresh() // updates the signed-in header badge; guest badge listens for mobigo-cart-updated
      toast.success("Added to cart", {
        description: `${product.name} · ${quantity === 1 ? "1 phone" : `${quantity} phones`}`,
        action: { label: "View cart", onClick: () => router.push("/cart") },
      })
    })
  }

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-10">
      <div className="flex flex-col gap-3">
        <div className="product-stage relative aspect-square overflow-hidden rounded-xl border border-border shadow-xs">
          {color?.images[0] ? (
            <Image
              src={color.images[0].url}
              alt={color.images[0].alt}
              width={800}
              height={800}
              priority
              unoptimized={color.images[0].url.endsWith(".svg")}
              className="size-full object-contain p-6 mix-blend-multiply lg:p-10"
            />
          ) : (
            <div className="size-full bg-skeleton" />
          )}
        </div>
        {color && color.images.length > 1 ? (
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {color.images.map((image) => (
              <li key={image.url} className="size-16 shrink-0 overflow-hidden rounded-md border border-border product-stage">
                <Image src={image.url} alt="" width={64} height={64} unoptimized={image.url.endsWith(".svg")} className="size-full object-contain" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start" id="buy">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-body-sm text-muted-foreground">{product.brandName}</p>
            <h1 className="font-display text-h1 tracking-[-0.02em] text-foreground lg:text-display">{product.name}</h1>
            {selected ? <PriceBlock price={selected.price} compareAtPrice={selected.compareAtPrice} className="mt-3" /> : null}
          </div>
          <div className="flex items-start gap-2">
            <WishlistHeart productId={product.id} productSlug={product.slug} initialSaved={wishlisted} />
            {compareEnabled ? <CompareToggle productId={product.id} slug={product.slug} /> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-body-sm font-semibold text-foreground">Colour</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((entry) => {
              const active = entry.id === selected?.colorId
              const disabled = !product.variants.some((variant) => variant.colorId === entry.id)
              return (
                <button
                  key={entry.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const next = product.variants.find((variant) => variant.colorId === entry.id)
                    if (next) setVariant(next.id)
                  }}
                  className={cn(
                    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-body-sm transition-colors duration-150 ease-brand outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40",
                    active ? "border-primary bg-primary/10 font-semibold text-foreground ring-1 ring-primary" : "border-border-strong hover:border-foreground/40"
                  )}
                >
                  <span className="size-4 rounded-full border border-border-strong" style={{ backgroundColor: entry.hex }} aria-hidden="true" />
                  {entry.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-body-sm font-semibold text-foreground">Storage & RAM</p>
          <div className="flex flex-wrap gap-2">
            {storageOptions.flatMap((storage) =>
              ramOptions.map((ram) => {
                const active = selected?.storageGb === storage && selected.ramGb === ram
                const enabled = comboActive(product, selected?.colorId ?? product.colors[0]?.id ?? "", ram, storage)
                return (
                  <button
                    key={`${storage}-${ram}`}
                    type="button"
                    disabled={!enabled}
                    onClick={() => selectCombo(selected?.colorId ?? product.colors[0]?.id ?? "", ram, storage)}
                    className={cn(
                      "min-h-11 cursor-pointer rounded-full border px-4 py-2 text-body-sm transition-colors duration-150 ease-brand outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:line-through disabled:opacity-40",
                      active ? "border-primary bg-primary/10 font-semibold text-foreground ring-1 ring-primary" : "border-border-strong hover:border-foreground/40"
                    )}
                  >
                    {storageLabel(storage)} / {ram}GB
                  </button>
                )
              })
            )}
          </div>
        </div>

        {selected ? (
          <dl className="grid gap-2 text-body-sm text-muted-foreground">
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">SKU</dt>
              <dd>{selected.sku}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">Delivery</dt>
              <dd>Dhaka 1 to 2 days · outside Dhaka 3 to 5 days</dd>
            </div>
          </dl>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          {availability ? (
            <QuantityStepper value={quantity} onValueChange={setQuantity} stock={availability.maxQuantity} maxPerOrder={availability.maxQuantity} />
          ) : null}
          {product.status === "PREORDER" ? <Badge variant="preorder">Pre-order</Badge> : null}
        </div>

        <div className="hidden gap-3 lg:flex">
          <Button type="button" className="flex-1" disabled={!canBuy || busy} loading={pendingAction === "buy"} onClick={handleBuyNow}>
            Buy Now
          </Button>
          <Button type="button" variant="outline" className="flex-1" disabled={!canBuy || busy} loading={pendingAction === "cart"} onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>

        <ul className="grid gap-2 rounded-xl border border-border bg-muted p-4 text-body-sm text-foreground">
          <li className="flex items-center gap-2.5">
            <BanknoteIcon className="size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            Cash on Delivery. Pay when it arrives.
          </li>
          <li className="flex items-center gap-2.5">
            <PhoneCallIcon className="size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            We call to confirm your order before it ships.
          </li>
        </ul>
      </div>

      <div data-buy-bar className="fixed inset-x-0 bottom-0 z-bar flex gap-2 border-t border-border bg-background p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-bar lg:hidden">
        <Button type="button" size="lg" className="flex-1" disabled={!canBuy || busy} loading={pendingAction === "buy"} onClick={handleBuyNow}>
          Buy Now
        </Button>
        <Button type="button" size="lg" variant="outline" className="flex-1" disabled={!canBuy || busy} loading={pendingAction === "cart"} onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
