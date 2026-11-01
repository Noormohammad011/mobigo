import { getCurrentUser } from "@/lib/auth/session"
import { isFlagOn } from "@/lib/flags"

import { MobileMenu } from "./mobile-menu"
import type { NavBrand } from "./nav"

export async function MobileMenuStaffSlot({
  brands,
  showCompare,
}: {
  brands: NavBrand[]
  showCompare: boolean
}) {
  const [user, adminCatalogOn] = await Promise.all([getCurrentUser(), isFlagOn("admin_catalog")])
  const showAdmin =
    adminCatalogOn && Boolean(user && (user.role === "STAFF" || user.role === "ADMIN"))

  return <MobileMenu brands={brands} showCompare={showCompare} showAdmin={showAdmin} />
}
