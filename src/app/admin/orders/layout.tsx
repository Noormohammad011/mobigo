import { requireAdminOrders } from "@/lib/admin/guard"

export default async function AdminOrdersLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOrders("/admin/orders")
  return children
}
