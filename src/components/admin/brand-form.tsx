"use client"

import { useActionState } from "react"

import { saveBrandAction } from "@/app/admin/catalog/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type BrandRow = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
  isFeatured: boolean
  sortOrder: number
}

export const BrandForm = ({ brand }: { brand?: BrandRow }) => {
  const [state, action, pending] = useActionState(saveBrandAction, undefined)

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      {brand ? <input type="hidden" name="id" value={brand.id} /> : null}
      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={brand?.name ?? ""} />
        <p className="text-caption text-muted-foreground">
          {brand ? (
            <>
              Slug: <span className="font-mono text-foreground">{brand.slug}</span> (updates from the name when you save)
            </>
          ) : (
            "The URL slug is created from the name when you save."
          )}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" type="url" defaultValue={brand?.logoUrl ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={brand?.description ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-body-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={brand?.isFeatured ?? false} className="size-4" />
        Featured on home
      </label>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={brand?.sortOrder ?? 0} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save brand"}
      </Button>
    </form>
  )
}
