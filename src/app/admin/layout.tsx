import { Suspense } from "react"

import { AdminAuthGate } from "@/components/admin/admin-auth-gate"
import Link from "next/link"

import { cn } from "@/lib/utils"

export const instant = false

const navLinkClass =
  "rounded-md px-3 py-2 text-body-sm font-semibold text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="border-b border-border bg-surface">
        <div className="page-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-caption text-muted-foreground hover:text-foreground">
              ← Storefront
            </Link>
            <p className="font-display text-h2 text-foreground">Admin</p>
          </div>
          <nav aria-label="Admin sections" className="flex flex-wrap gap-1">
            <Link href="/admin/catalog/brands" className={navLinkClass}>
              Brands
            </Link>
            <Link href="/admin/catalog/products" className={navLinkClass}>
              Products
            </Link>
            <Link href="/admin/merchandising/collections" className={navLinkClass}>
              Collections
            </Link>
            <Link href="/admin/merchandising/banners" className={navLinkClass}>
              Banners
            </Link>
            <Link href="/admin/orders" className={navLinkClass}>
              Orders
            </Link>
            <Link href="/admin/settings" className={navLinkClass}>
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className={cn("page-container py-6 lg:py-10")}>
        <Suspense fallback={<p className="text-body-sm text-muted-foreground">Loading admin…</p>}>
          <AdminAuthGate>{children}</AdminAuthGate>
        </Suspense>
      </main>
    </div>
  )
}
