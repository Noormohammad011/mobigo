import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { BannerForm } from "@/components/admin/banner-form"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { getAdminBanner } from "@/lib/queries/admin-merchandising"

export const instant = false

const BannerEdit = async ({ id }: { id: string }) => {
  const banner = await getAdminBanner(id)
  if (!banner) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/merchandising/banners" className="text-body-sm text-link hover:underline">
          ← Banners
        </Link>
        <h1 className="font-display text-h1 text-foreground">{banner.title}</h1>
      </div>
      <BannerForm banner={banner} />
    </div>
  )
}

export default async function AdminBannerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<AdminPageFallback title="Banner" />}>
      <BannerEdit id={id} />
    </Suspense>
  )
}
