"use client"

import { useActionState } from "react"

import { trackOrderAction, type TrackOrderState } from "@/app/track/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const statusLabel: Record<string, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
}

export const TrackOrderForm = ({ initialOrderNumber }: { initialOrderNumber: string }) => {
  const [state, action, pending] = useActionState<TrackOrderState | null, FormData>(trackOrderAction, null)

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="grid max-w-md gap-4 rounded-lg border border-border bg-card p-4">
        <div className="grid gap-2">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input id="orderNumber" name="orderNumber" required defaultValue={initialOrderNumber} placeholder="MG-261031-000001" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Mobile used at checkout</Label>
          <Input id="phone" name="phone" required inputMode="tel" placeholder="01XXXXXXXXX" />
        </div>
        {state && !state.ok ? (
          <p className="text-body-sm text-danger-text" role="alert">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {state && state.ok ? (
        <section className="max-w-md rounded-lg border border-border bg-card p-4">
          <h2 className="font-display text-h3 text-foreground">{state.orderNumber}</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">{statusLabel[state.status] ?? state.status}</p>
          <ol className="mt-4 flex flex-col gap-3 border-l border-border pl-4">
            {state.timeline.map((step, index) => (
              <li key={`${step.at.toISOString()}-${index}`} className="text-body-sm">
                <p className="font-medium text-foreground">{step.label}</p>
                <time className="text-muted-foreground" dateTime={step.at.toISOString()}>
                  {step.at.toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
                </time>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  )
}
