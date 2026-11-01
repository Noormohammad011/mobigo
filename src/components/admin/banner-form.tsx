"use client"

import { useActionState } from "react"

import { deleteBannerAction, saveBannerAction } from "@/app/admin/merchandising/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toDateTimeLocalValue } from "@/lib/admin/merchandising-schemas"
import type { Banner } from "@/generated/prisma/client"

const placementLabels: Record<Banner["placement"], string> = {
  HERO: "Hero carousel",
  HERO_SIDE: "Hero side tiles",
  HOME_MID: "Home mid section",
  PROMO_MODAL: "Promo modal",
}

export const BannerForm = ({ banner }: { banner?: Banner }) => {
  const [state, action, pending] = useActionState(saveBannerAction, undefined)
  const [, deleteAction, deletePending] = useActionState(deleteBannerAction, undefined)

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
        {state?.error ? (
          <p className="text-body-sm text-danger-text" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={banner?.title ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="placement">Placement</Label>
          <select
            id="placement"
            name="placement"
            defaultValue={banner?.placement ?? "HERO"}
            className="h-10 rounded-md border border-border bg-background px-3 text-body-sm"
          >
            {(Object.keys(placementLabels) as Banner["placement"][]).map((key) => (
              <option key={key} value={key}>
                {placementLabels[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="imageMobileUrl">Mobile image URL</Label>
          <Input id="imageMobileUrl" name="imageMobileUrl" type="url" required defaultValue={banner?.imageMobileUrl ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="imageDesktopUrl">Desktop image URL</Label>
          <Input
            id="imageDesktopUrl"
            name="imageDesktopUrl"
            type="url"
            required
            defaultValue={banner?.imageDesktopUrl ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="alt">Alt text</Label>
          <Input id="alt" name="alt" required defaultValue={banner?.alt ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="linkUrl">Link URL (optional)</Label>
          <Input id="linkUrl" name="linkUrl" type="url" defaultValue={banner?.linkUrl ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={banner?.sortOrder ?? 0} />
        </div>
        <label className="flex items-center gap-2 text-body-sm">
          <input type="checkbox" name="isActive" defaultChecked={banner?.isActive ?? true} className="size-4" />
          Active
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="startsAt">Starts at (optional)</Label>
            <Input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toDateTimeLocalValue(banner?.startsAt)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="endsAt">Ends at (optional)</Label>
            <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toDateTimeLocalValue(banner?.endsAt)} />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : banner ? "Save banner" : "Create banner"}
        </Button>
      </form>

      {banner ? (
        <form action={deleteAction} className="rounded-lg border border-border bg-surface p-4">
          <input type="hidden" name="id" value={banner.id} />
          <p className="text-body-sm text-muted-foreground">Remove this banner from the store permanently.</p>
          <Button type="submit" variant="destructive" className="mt-3" disabled={deletePending}>
            {deletePending ? "Deleting…" : "Delete banner"}
          </Button>
        </form>
      ) : null}
    </div>
  )
}
