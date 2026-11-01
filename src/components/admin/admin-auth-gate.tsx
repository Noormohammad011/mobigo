import { requireRole } from "@/lib/auth/session"

export async function AdminAuthGate({ children }: { children: React.ReactNode }) {
  await requireRole(["STAFF", "ADMIN"], "/admin")
  return children
}
