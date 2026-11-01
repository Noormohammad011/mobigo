import "server-only"

import { assertFlag } from "@/lib/flags"
import { requireRole } from "@/lib/auth/session"

export const requireAdminCatalog = async (nextPath: string) => {
  await assertFlag("admin_catalog")
  return requireRole(["STAFF", "ADMIN"], nextPath)
}

export const requireAdminMerchandising = async (nextPath: string) => {
  await assertFlag("admin_merchandising")
  return requireRole(["STAFF", "ADMIN"], nextPath)
}

export const requireAdminOrders = async (nextPath: string) => {
  await assertFlag("admin_orders")
  return requireRole(["STAFF", "ADMIN"], nextPath)
}

export const requireAdminSettings = async (nextPath: string) => {
  await assertFlag("admin_settings")
  return requireRole(["STAFF", "ADMIN"], nextPath)
}
