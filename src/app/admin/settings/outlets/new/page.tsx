import { OutletForm } from "@/components/admin/outlet-form"
import Link from "next/link"

export const instant = false

export default function AdminNewOutletPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/settings/outlets" className="text-body-sm text-link hover:underline">
        ← Outlets
      </Link>
      <h1 className="font-display text-h1 text-foreground">New outlet</h1>
      <OutletForm />
    </div>
  )
}
