"use client"

import { useActionState } from "react"

import { createDraftProductAction } from "@/app/admin/catalog/actions"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/ui/form-select"
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
        <FormSelect
          name="brandId"
          required
          placeholder="Select brand"
          options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
        />
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
