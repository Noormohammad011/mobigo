import { requireAdminCatalog } from "@/lib/admin/guard"

export default async function AdminCatalogLayout({ children }: { children: React.ReactNode }) {
  await requireAdminCatalog("/admin/catalog")
  return children
}
