"use client"

import { useActionState } from "react"

import { transitionOrderAction } from "@/app/admin/orders/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { OrderStatus } from "@/generated/prisma/client"
import { allowedNextStatuses, orderStatusLabel } from "@/lib/orders/order-status"

export const AdminOrderTransitionForm = ({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) => {
  const next = allowedNextStatuses(currentStatus)
  const [state, action, pending] = useActionState(transitionOrderAction, undefined)

  if (next.length === 0) {
    return <p className="text-body-sm text-muted-foreground">No further status changes for this order.</p>
  }

  return (
    <form action={action} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <h2 className="font-display text-h3 text-foreground">Update status</h2>
      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? <p className="text-body-sm text-success-text">Status updated.</p> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="toStatus">New status</Label>
        <select
          id="toStatus"
          name="toStatus"
          required
          defaultValue={next[0]}
          className="h-10 rounded-md border border-border bg-background px-3 text-body-sm"
        >
          {next.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" name="note" rows={2} placeholder="Called customer, courier picked up…" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Apply status change"}
      </Button>
    </form>
  )
}
