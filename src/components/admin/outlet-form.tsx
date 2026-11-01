"use client"

import { useActionState } from "react"

import { saveOutletAction } from "@/app/admin/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type OutletRow = {
  id: string
  name: string
  address: string
  phone: string | null
  mapUrl: string | null
  hours: string | null
  sortOrder: number
}

export const OutletForm = ({ outlet }: { outlet?: OutletRow }) => {
  const [state, action, pending] = useActionState(saveOutletAction, undefined)

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      {outlet ? <input type="hidden" name="id" value={outlet.id} /> : null}
      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={outlet?.name ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" required rows={3} defaultValue={outlet?.address ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={outlet?.phone ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="mapUrl">Map URL</Label>
        <Input id="mapUrl" name="mapUrl" type="url" defaultValue={outlet?.mapUrl ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="hours">Hours</Label>
        <Input id="hours" name="hours" defaultValue={outlet?.hours ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={outlet?.sortOrder ?? 0} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : outlet ? "Save outlet" : "Create outlet"}
      </Button>
    </form>
  )
}
