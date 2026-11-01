"use client"

import { useActionState } from "react"

import { saveContactSettingsAction } from "@/app/admin/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Values = {
  support_phone: string
  support_email: string
  whatsapp_number: string
  facebook_url: string
  youtube_url: string
  order_max_subtotal: string
}

export const ContactSettingsForm = ({ values }: { values: Values }) => {
  const [state, action, pending] = useActionState(saveContactSettingsAction, undefined)

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      {state?.error ? (
        <p className="text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? <p className="text-body-sm text-success-text">Settings saved.</p> : null}
      {(["support_phone", "support_email", "whatsapp_number"] as const).map((key) => (
        <div key={key} className="flex flex-col gap-2">
          <Label htmlFor={key}>{key.replace(/_/g, " ")}</Label>
          <Input id={key} name={key} defaultValue={values[key]} />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <Label htmlFor="facebook_url">Facebook URL</Label>
        <Input id="facebook_url" name="facebook_url" type="url" defaultValue={values.facebook_url} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="youtube_url">YouTube URL</Label>
        <Input id="youtube_url" name="youtube_url" type="url" defaultValue={values.youtube_url} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="order_max_subtotal">Max checkout subtotal (BDT)</Label>
        <Input id="order_max_subtotal" name="order_max_subtotal" type="number" min={1000} defaultValue={values.order_max_subtotal} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  )
}
