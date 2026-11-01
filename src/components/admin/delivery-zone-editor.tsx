"use client"

import { useActionState } from "react"

import { addZoneDistrictAction, removeZoneDistrictFormAction, saveZoneAction } from "@/app/admin/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ZoneRow = {
  id: string
  name: string
  fee: number
  etaMinDays: number
  etaMaxDays: number
  isActive: boolean
  districts: { district: string }[]
}

export const DeliveryZoneEditor = ({ zone }: { zone: ZoneRow }) => {
  const [state, action, pending] = useActionState(saveZoneAction, undefined)
  const [districtState, districtAction, districtPending] = useActionState(addZoneDistrictAction, undefined)

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex max-w-lg flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <input type="hidden" name="id" value={zone.id} />
        {state?.error ? (
          <p className="text-body-sm text-danger-text" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Zone name</Label>
          <Input id="name" name="name" required defaultValue={zone.name} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fee">Delivery fee (BDT)</Label>
          <Input id="fee" name="fee" type="number" min={0} required defaultValue={zone.fee} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="etaMinDays">Min days</Label>
            <Input id="etaMinDays" name="etaMinDays" type="number" min={0} defaultValue={zone.etaMinDays} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="etaMaxDays">Max days</Label>
            <Input id="etaMaxDays" name="etaMaxDays" type="number" min={0} defaultValue={zone.etaMaxDays} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-body-sm">
          <input type="checkbox" name="isActive" defaultChecked={zone.isActive} className="size-4" />
          Active at checkout
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save zone"}
        </Button>
      </form>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="font-display text-h3 text-foreground">Districts</h2>
        <p className="mt-1 text-body-sm text-muted-foreground">Each district maps to one zone at checkout.</p>
        {districtState?.error ? (
          <p className="mt-2 text-body-sm text-danger-text" role="alert">
            {districtState.error}
          </p>
        ) : null}
        {districtState?.ok ? <p className="mt-2 text-body-sm text-success-text">District saved.</p> : null}
        <ul className="mt-3 flex flex-col gap-2">
          {zone.districts.map((row) => (
            <li
              key={row.district}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-body-sm"
            >
              <span>{row.district}</span>
              <form action={removeZoneDistrictFormAction}>
                <input type="hidden" name="district" value={row.district} />
                <input type="hidden" name="zoneId" value={zone.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
        <form action={districtAction} className="mt-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="zoneId" value={zone.id} />
          <div className="flex min-w-[200px] flex-1 flex-col gap-1">
            <Label htmlFor="district">Add district</Label>
            <Input id="district" name="district" required placeholder="e.g. Sylhet" />
          </div>
          <Button type="submit" disabled={districtPending}>
            Add
          </Button>
        </form>
      </section>
    </div>
  )
}
