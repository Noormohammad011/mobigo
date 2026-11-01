"use client"

import { useActionState } from "react"

import { saveCollectionAction } from "@/app/admin/merchandising/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toDateTimeLocalValue } from "@/lib/admin/merchandising-schemas"

type CollectionRow = {
  id: string
  title: string
  slug: string
  description: string | null
  showOnHome: boolean
  sortOrder: number
  startsAt: Date | null
  endsAt: Date | null
}

export const CollectionForm = ({ collection }: { collection?: CollectionRow }) => {
  const [state, action, pending] = useActionState(saveCollectionAction, undefined)

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      {collection ? <input type="hidden" name="id" value={collection.id} /> : null}
      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={collection?.title ?? ""} />
        <p className="text-caption text-muted-foreground">
          {collection ? (
            <>
              Slug: <span className="font-mono text-foreground">{collection.slug}</span> (updates from the title when you save)
            </>
          ) : (
            "The URL slug is created from the title when you save."
          )}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={collection?.description ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-body-sm">
        <input type="checkbox" name="showOnHome" defaultChecked={collection?.showOnHome ?? true} className="size-4" />
        Show on home page
      </label>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={collection?.sortOrder ?? 0} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startsAt">Starts at (optional)</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalValue(collection?.startsAt)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endsAt">Ends at (optional)</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toDateTimeLocalValue(collection?.endsAt)} />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : collection ? "Save collection" : "Create collection"}
      </Button>
    </form>
  )
}
