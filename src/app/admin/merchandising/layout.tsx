import { requireAdminMerchandising } from "@/lib/admin/guard"

export default async function AdminMerchandisingLayout({ children }: { children: React.ReactNode }) {
  await requireAdminMerchandising("/admin/merchandising")
  return children
}
