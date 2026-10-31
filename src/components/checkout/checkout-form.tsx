"use client"

import Link from "next/link"
import { useActionState, useMemo, useState } from "react"

import { placeOrderAction, type PlaceOrderState } from "@/app/checkout/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatBDT } from "@/lib/format"
import type { CheckoutLineInput } from "@/lib/orders/place-order"
import { cn } from "@/lib/utils"

type ZoneRow = { district: string; zoneName: string; fee: number }

export const CheckoutForm = ({
  signedIn,
  guestLines,
  zones,
  initialName,
  initialPhone,
  initialEmail,
  subtotal,
  deliveryFee,
}: {
  signedIn: boolean
  guestLines: CheckoutLineInput[]
  zones: ZoneRow[]
  initialName: string
  initialPhone: string
  initialEmail: string
  subtotal: number
  deliveryFee: number
}) => {
  const [district, setDistrict] = useState(zones[0]?.district ?? "")
  const fee = useMemo(() => zones.find((z) => z.district === district)?.fee ?? deliveryFee, [district, deliveryFee, zones])

  const boundPlace = placeOrderAction.bind(null, guestLines)
  const [state, action, pending] = useActionState<PlaceOrderState | null, FormData>(boundPlace, null)

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="grid gap-4 rounded-lg border border-border bg-card p-4">
        <h2 className="font-display text-h3 text-foreground">Delivery details</h2>
        <div className="grid gap-2">
          <Label htmlFor="customerName">Full name</Label>
          <Input id="customerName" name="customerName" required defaultValue={initialName} autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customerPhone">Mobile</Label>
          <Input id="customerPhone" name="customerPhone" required defaultValue={initialPhone} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customerEmail">Email (optional)</Label>
          <Input id="customerEmail" name="customerEmail" type="email" defaultValue={initialEmail} autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="district">District</Label>
          <select
            id="district"
            name="district"
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={cn("h-11 w-full rounded-md border border-input bg-background px-3 text-body text-foreground")}
          >
            {zones.map((z) => (
              <option key={z.district} value={z.district}>
                {z.district} ({formatBDT(z.fee)} delivery)
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="area">Area</Label>
          <Input id="area" name="area" required placeholder="e.g. Dhanmondi" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="addressLine">Address</Label>
          <Textarea id="addressLine" name="addressLine" required rows={3} placeholder="House, road, landmark" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea id="note" name="note" rows={2} />
        </div>
      </section>

      <section className="grid gap-2 rounded-lg border border-border bg-card p-4">
        <h2 className="font-display text-h3 text-foreground">Payment</h2>
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-body-sm text-foreground">
          Cash on Delivery · Pay when you receive your phone.
        </p>
      </section>

      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="flex justify-between text-body-sm text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-price">{formatBDT(subtotal)}</span>
        </p>
        <p className="flex justify-between text-body-sm text-muted-foreground">
          <span>Delivery</span>
          <span className="font-price">{formatBDT(fee)}</span>
        </p>
        <p className="flex justify-between text-body font-semibold text-foreground">
          <span>Total</span>
          <span className="font-price">{formatBDT(subtotal + fee)}</span>
        </p>
        {!signedIn ? (
          <p className="text-body-sm text-muted-foreground">
            Guest checkout ·{" "}
            <Link href="/auth/login?next=/checkout" className="text-link underline">
              Sign in
            </Link>{" "}
            to save your details.
          </p>
        ) : null}
        {state && !state.ok ? (
          <p className="text-body-sm text-danger-text" role="alert">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="mt-2 h-12">
          {pending ? "Placing order…" : "Place order"}
        </Button>
      </section>
    </form>
  )
}
