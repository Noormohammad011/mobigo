"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import { addToCartAction } from "@/app/cart/actions"
import { Price } from "@/components/commerce/price-block"
import { QuantityStepper } from "@/components/commerce/quantity-stepper"
import { Badge } from "@/components/ui/badge"
import { WishlistHeart } from "@/components/wishlist/wishlist-heart"
import { Button, buttonVariants } from "@/components/ui/button"
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
}: {
  product: ProductDetailPayload
  signedIn: boolean
  wishlisted: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [quantity, setQuantity] = useState(1)

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

  const handleAdd = () => {
    if (!selected || !availability || !canBuy) return
    const variantLabel = `${storageLabel(selected.storageGb)} / ${selected.ramGb}GB RAM`
    const imageUrl = color?.images[0]?.url ?? null
    if (!signedIn) {
      addGuestLine({
        variantId: selected.id,
        quantity,
        unitPrice: selected.price,
        productName: product.name,
        productSlug: product.slug,
        variantLabel,
        imageUrl,
      })
      router.push("/cart")
      return
    }
    startTransition(async () => {
      const result = await addToCartAction({ variantId: selected.id, quantity, unitPrice: selected.price })
      if (result.ok) router.push("/cart")
    })
  }

  const canBuy = selected && availability && quantityAllowed(availability.reason, availability.maxQuantity, quantity)

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-10">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
          {color?.images[0] ? (
            <Image
              src={color.images[0].url}
              alt={color.images[0].alt}
              width={800}
              height={800}
              priority
              unoptimized={color.images[0].url.endsWith(".svg")}
              className="size-full object-contain"
            />
          ) : (
            <div className="size-full bg-skeleton" />
          )}
        </div>
        {color && color.images.length > 1 ? (
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {color.images.map((image) => (
              <li key={image.url} className="size-16 shrink-0 overflow-hidden rounded-sm border border-border bg-white">
                <Image src={image.url} alt="" width={64} height={64} unoptimized={image.url.endsWith(".svg")} className="size-full object-contain" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-6" id="buy">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-body-sm text-muted-foreground">{product.brandName}</p>
            <h1 className="font-display text-h1 text-foreground">{product.name}</h1>
            {selected ? <Price price={selected.price} compareAtPrice={selected.compareAtPrice} className="mt-3" /> : null}
          </div>
          <WishlistHeart productId={product.id} productSlug={product.slug} initialSaved={wishlisted} />
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
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-body-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40",
                    active ? "border-primary bg-primary/10" : "border-border-strong"
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
                      "rounded-full border px-3 py-2 text-body-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:line-through disabled:opacity-40",
                      active ? "border-primary bg-primary/10" : "border-border-strong"
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
          <Button type="button" className="flex-1" disabled={!canBuy || pending} onClick={handleAdd}>
            Add to cart
          </Button>
          <Link href="/cart" className={cn(buttonVariants({ variant: "outline", className: "flex-1" }))}>
            Buy now
          </Link>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-bar flex gap-2 border-t border-border bg-background p-3 pb-safe shadow-bar lg:hidden">
        <Button type="button" className="flex-1" disabled={!canBuy || pending} onClick={handleAdd}>
          Add to cart
        </Button>
        <Link href="/cart" className={cn(buttonVariants({ variant: "outline", className: "flex-1" }))}>
          Buy now
        </Link>
      </div>
    </div>
  )
}
