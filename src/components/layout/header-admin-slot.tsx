import { LayoutDashboardIcon } from "lucide-react"

import { getCurrentUser } from "@/lib/auth/session"
import { isFlagOn } from "@/lib/flags"

import { HeaderIconLink } from "./header-icon-link"

/** Session read for staff admin shortcut; keep inside Suspense so layouts can prerender. */
export async function HeaderAdminSlot() {
  const [user, adminCatalogOn] = await Promise.all([getCurrentUser(), isFlagOn("admin_catalog")])
  const showAdmin =
    adminCatalogOn && Boolean(user && (user.role === "STAFF" || user.role === "ADMIN"))
  if (!showAdmin) return null

  return (
    <HeaderIconLink href="/admin" aria-label="Admin dashboard" className="inline-flex">
      <LayoutDashboardIcon strokeWidth={1.75} aria-hidden="true" />
    </HeaderIconLink>
  )
}
