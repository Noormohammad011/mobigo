"use client"

import { useActionState } from "react"

import { createDraftProductAction } from "@/app/admin/catalog/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const NewProductForm = ({
  brands,
}: {
  brands: { id: string; name: string }[]
}) => {
  const [state, action, pending] = useActionState(createDraftProductAction, undefined)

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="brandId">Brand</Label>
        <select
          id="brandId"
          name="brandId"
          required
          className="h-12 rounded-md border border-input bg-background px-3 text-body-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select brand
          </option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" name="name" required />
        <p className="text-caption text-muted-foreground">The URL slug is created from the name when you save.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create draft"}
      </Button>
    </form>
  )
}
