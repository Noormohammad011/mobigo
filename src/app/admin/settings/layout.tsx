import { requireAdminSettings } from "@/lib/admin/guard"

export default async function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSettings("/admin/settings")
  return children
}
