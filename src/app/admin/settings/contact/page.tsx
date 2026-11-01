import Link from "next/link"
import { Suspense } from "react"

import { ContactSettingsForm } from "@/components/admin/contact-settings-form"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { getAdminContactSettings } from "@/lib/queries/admin-settings"

export const instant = false

const ContactSettings = async () => {
  const values = await getAdminContactSettings()
  return <ContactSettingsForm values={values} />
}

export default function AdminContactSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/settings" className="text-body-sm text-link hover:underline">
        ← Settings
      </Link>
      <h1 className="font-display text-h1 text-foreground">Contact & store</h1>
      <Suspense fallback={<AdminPageFallback title="Contact settings" />}>
        <ContactSettings />
      </Suspense>
    </div>
  )
}
