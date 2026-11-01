import Link from "next/link"
import { Suspense } from "react"

import { AdminPageFallback } from "@/components/admin/admin-page-fallback"
import { cmsPageLabel, cmsPagePath } from "@/lib/content/cms-pages"
import { listAdminPages } from "@/lib/queries/admin-settings"

export const instant = false

const PagesTable = async () => {
  const pages = await listAdminPages()
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] text-body-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-3 font-semibold">Page</th>
            <th className="p-3 font-semibold">Slug</th>
            <th className="p-3 font-semibold">Published</th>
            <th className="p-3 font-semibold">Updated</th>
            <th className="p-3 font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id} className="border-b border-border last:border-0">
              <td className="p-3 font-medium text-foreground">{page.title}</td>
              <td className="p-3 text-muted-foreground">{page.slug}</td>
              <td className="p-3">{page.isPublished ? "Yes" : "No"}</td>
              <td className="p-3 text-muted-foreground">{page.updatedAt.toLocaleDateString("en-GB")}</td>
              <td className="p-3 text-right">
                <Link href={`/admin/settings/pages/${page.id}`} className="text-link hover:underline">
                  Edit
                </Link>
                {" · "}
                <Link href={cmsPagePath(page.slug)} className="text-link hover:underline" target="_blank">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminPagesListPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/settings" className="text-body-sm text-link hover:underline">
        ← Settings
      </Link>
      <h1 className="font-display text-h1 text-foreground">Content pages</h1>
      <p className="text-body-sm text-muted-foreground">
        Footer policies and help pages ({cmsPageLabel("about")}, {cmsPageLabel("faq")}, etc.).
      </p>
      <Suspense fallback={<AdminPageFallback title="Pages" />}>
        <PagesTable />
      </Suspense>
    </div>
  )
}
