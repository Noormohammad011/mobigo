"use client"

import { useActionState } from "react"

import { savePageAction } from "@/app/admin/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cmsPagePath } from "@/lib/content/cms-pages"

type PageRow = {
  id: string
  slug: string
  title: string
  content: string
  metaDescription: string | null
  isPublished: boolean
}

export const CmsPageForm = ({ page }: { page: PageRow }) => {
  const [state, action, pending] = useActionState(savePageAction, undefined)

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <input type="hidden" name="id" value={page.id} />
      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      <p className="text-body-sm text-muted-foreground">
        Slug: <span className="font-mono text-foreground">{page.slug}</span> · Storefront:{" "}
        <a href={cmsPagePath(page.slug)} className="text-link hover:underline" target="_blank" rel="noopener noreferrer">
          Preview
        </a>
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={page.title} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="metaDescription">Meta description</Label>
        <Input id="metaDescription" name="metaDescription" defaultValue={page.metaDescription ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" required rows={16} defaultValue={page.content} className="font-mono text-body-sm" />
      </div>
      <label className="flex items-center gap-2 text-body-sm">
        <input type="checkbox" name="isPublished" defaultChecked={page.isPublished} className="size-4" />
        Published
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save page"}
      </Button>
    </form>
  )
}
