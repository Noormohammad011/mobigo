"use client"

import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Fragment, useEffect, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

import { loadCompareTableAction } from "@/app/compare/actions"
import { CompareSlotSearch } from "@/components/compare/compare-slot-search"
import { Checkbox } from "@/components/ui/checkbox"
import { Button, buttonVariants } from "@/components/ui/button"
import type { CompareProductColumn, CompareTablePayload } from "@/lib/queries/compare"
import {
  compareSlugsToSearch,
  COMPARE_SERVER_SNAPSHOT,
  getCompareSnapshot,
  isCompareListInitialized,
  readCompareSlugs,
  removeCompareSlug,
  subscribeCompare,
} from "@/lib/compare/compare-list"
import { formatBDT } from "@/lib/format"
import { cn } from "@/lib/utils"

const SLOT_COUNT = 3

const slotColumnClass = (index: number) =>
  cn(index >= 2 && "hidden lg:block", index >= 0 && "border-border lg:border-l")

export const CompareView = ({
  initial,
  initialSlugs,
}: {
  initial: CompareTablePayload
  initialSlugs: string[]
}) => {
  const router = useRouter()
  const storedSlugs = useSyncExternalStore(subscribeCompare, getCompareSnapshot, () => COMPARE_SERVER_SNAPSHOT)
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [highlight, setHighlight] = useState(false)
  const [payload, setPayload] = useState(initial)
  const [loading, setLoading] = useState(false)

  const slugs =
    !isClient || !isCompareListInitialized() ? initialSlugs : storedSlugs

  useEffect(() => {
    if (!isClient) return
    const local = readCompareSlugs()
    const query = compareSlugsToSearch(local)
    const target = query ? `/compare${query}` : "/compare"
    if (typeof window !== "undefined" && `${window.location.pathname}${window.location.search}` !== target) {
      router.replace(target)
    }
  }, [router, storedSlugs, isClient])

  useEffect(() => {
    if (slugs.length === 0) {
      setPayload({ products: [], droppedSlugs: [], groups: [] })
      return
    }
    setLoading(true)
    void loadCompareTableAction(slugs).then((next) => {
      setPayload(next)
      setLoading(false)
    })
  }, [slugs.join(",")])

  const visibleProducts = payload.products
  const slots: (CompareProductColumn | null)[] = Array.from({ length: SLOT_COUNT }, (_, index) => visibleProducts[index] ?? null)
  const excludeSlugs = visibleProducts.map((product) => product.slug)
  const isEmpty = slugs.length === 0 && visibleProducts.length === 0

  return (
    <div className="page-container flex flex-col gap-4 py-6 lg:gap-6 lg:py-10">
      <nav aria-label="Breadcrumb" className="text-body-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="text-link hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Compare</li>
        </ol>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-h1 text-foreground">Compare selected phones</h1>
        {!isEmpty ? (
          <label className="flex cursor-pointer items-center gap-2 text-body-sm text-foreground">
            <Checkbox
              checked={highlight}
              onCheckedChange={(value) => setHighlight(Boolean(value))}
              aria-label="Highlight differences"
            />
            Highlight differences
          </label>
        ) : null}
      </div>

      {payload.droppedSlugs.length > 0 ? (
        <p className="text-body-sm text-muted-foreground" role="status">
          Some phones are no longer available and were removed from this comparison.
        </p>
      ) : null}

      {loading ? <p className="text-body-sm text-muted-foreground">Loading comparison…</p> : null}

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-1 border-b border-border lg:grid-cols-4">
            <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
              <p className="font-semibold text-foreground">Compare products</p>
              <p className="mt-2 text-body-sm text-muted-foreground">
                Find and select phones to see differences and similarities between them.
              </p>
              {isEmpty ? (
                <Link href="/phones" className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-4 w-fit")}>
                  Browse phones
                </Link>
              ) : null}
            </div>
            {slots.map((product, index) => (
              <CompareProductSlot
                key={`slot-${index}`}
                slotIndex={index}
                product={product}
                excludeSlugs={excludeSlugs}
                className={cn("border-b border-border p-4 lg:border-b-0", slotColumnClass(index))}
              />
            ))}
          </div>

          {!isEmpty && visibleProducts.length > 0 ? (
            <div className="divide-y divide-border">
              {payload.groups.map((group) => (
                <Fragment key={group.name}>
                  <div className="grid bg-muted/50 lg:grid-cols-4">
                    <div className="col-span-full px-4 py-2 font-semibold text-foreground">{group.name}</div>
                  </div>
                  {group.attributes.map((attribute, rowIndex) => (
                    <CompareSpecRow
                      key={attribute.id}
                      label={attribute.unit ? `${attribute.name} (${attribute.unit})` : attribute.name}
                      values={slots.map((product) =>
                        product ? product.valuesByAttributeId[attribute.id] ?? "—" : ""
                      )}
                      highlight={highlight}
                      zebra={rowIndex % 2 === 1}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const CompareProductSlot = ({
  slotIndex,
  product,
  excludeSlugs,
  className,
}: {
  slotIndex: number
  product: CompareProductColumn | null
  excludeSlugs: string[]
  className?: string
}) => {
  const filteredExclude = product ? excludeSlugs.filter((slug) => slug !== product.slug) : excludeSlugs

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <CompareSlotSearch slotIndex={slotIndex} excludeSlugs={filteredExclude} />
      <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 text-center">
        {product?.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            width={120}
            height={120}
            className="size-[120px] object-contain"
            unoptimized={product.imageUrl.endsWith(".svg")}
          />
        ) : (
          <div className="flex size-[120px] items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            <ImageIcon className="size-12 stroke-[1.25]" aria-hidden="true" />
          </div>
        )}
        {product ? (
          <>
            <p className="text-body-sm font-semibold text-foreground">{product.name}</p>
            <p className="font-price text-body font-semibold text-foreground">{formatBDT(product.minPrice)}</p>
            <div className="flex w-full max-w-[200px] flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => removeCompareSlug(product.slug)}
              >
                Remove
              </Button>
              <Link
                href={`/phones/${product.slug}`}
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "flex-1")}
              >
                Shop now
              </Link>
            </div>
          </>
        ) : (
          <p className="text-caption text-muted-foreground">Search to add a phone</p>
        )}
      </div>
    </div>
  )
}

const CompareSpecRow = ({
  label,
  values,
  highlight,
  zebra,
}: {
  label: string
  values: string[]
  highlight: boolean
  zebra: boolean
}) => {
  const displayValues = values.map((value) => (value === "" ? "—" : value))
  const trimmed = displayValues.map((value) => value.trim())

  return (
    <div
      className={cn(
        "grid lg:grid-cols-4",
        zebra ? "bg-muted/30" : "bg-background"
      )}
    >
      <div className="border-border px-4 py-3 font-medium text-foreground lg:border-r">{label}</div>
      {displayValues.map((value, index) => {
        const differsFromAnother =
          highlight &&
          trimmed[index] !== "—" &&
          trimmed.some((other, otherIndex) => otherIndex !== index && other !== "—" && other !== trimmed[index])
        return (
          <div
            key={`${label}-${index}`}
            className={cn(
              "border-t border-border px-4 py-3 text-body-sm text-foreground lg:border-t-0 lg:border-l",
              index >= 2 && "hidden lg:block",
              differsFromAnother && "bg-accent/60"
            )}
          >
            {value}
          </div>
        )
      })}
    </div>
  )
}
