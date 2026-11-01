"use client"

import { FormSelect } from "@/components/ui/form-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import type { ProductStatus } from "@/generated/prisma/client"
import { cn } from "@/lib/utils"

const STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "PREORDER", "DISCONTINUED"]

export function AdminProductsFilterForm({
  defaultQuery,
  defaultBrandId,
  defaultStatus,
  brands,
}: {
  defaultQuery: string
  defaultBrandId: string
  defaultStatus: string
  brands: { id: string; name: string }[]
}) {
  return (
    <form method="get" className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2 md:grid-cols-4">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="q">Search</Label>
        <Input id="q" name="q" defaultValue={defaultQuery} placeholder="Name or slug" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="brandId">Brand</Label>
        <FormSelect
          name="brandId"
          defaultValue={defaultBrandId}
          placeholder="All brands"
          options={[{ value: "", label: "All brands" }, ...brands.map((b) => ({ value: b.id, label: b.name }))]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Status</Label>
        <FormSelect
          name="status"
          defaultValue={defaultStatus}
          placeholder="All statuses"
          options={[{ value: "", label: "All statuses" }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
        />
      </div>
      <div className="sm:col-span-2 md:col-span-4">
        <button type="submit" className={cn(buttonVariants({ variant: "secondary" }), "rounded-full")}>
          Apply filters
        </button>
      </div>
    </form>
  )
}
