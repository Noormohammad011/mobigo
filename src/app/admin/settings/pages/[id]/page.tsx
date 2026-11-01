import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CmsPageForm } from "@/components/admin/cms-page-form"
import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { getAdminPage } from "@/lib/queries/admin-settings"

export const instant = false

const PageEdit = async ({ id, saved }: { id: string; saved?: boolean }) => {
  const page = await getAdminPage(id)
  if (!page) notFound()

  return (
    <div className="flex flex-col gap-6">
      {saved ? <p className="text-body-sm text-success-text">Page saved.</p> : null}
      <Link href="/admin/settings/pages" className="text-body-sm text-link hover:underline">
        ← Content pages
      </Link>
      <h1 className="font-display text-h1 text-foreground">{page.title}</h1>
      <CmsPageForm page={page} />
    </div>
  )
}

export default async function AdminPageEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const { id } = await params
  const { saved } = await searchParams
  return (
    <Suspense fallback={<AdminPageFallback title="Edit page" />}>
      <PageEdit id={id} saved={saved === "1"} />
    </Suspense>
  )
}
