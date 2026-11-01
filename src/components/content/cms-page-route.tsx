import type { ReactNode } from "react"
import { Suspense } from "react"
import { connection } from "next/server"

import { CmsPageBody } from "@/components/content/cms-page-body"
import { requirePublishedPage } from "@/lib/queries/content"

const fallback = (
  <div className="page-container max-w-3xl py-8 lg:py-12">
    <p className="text-body-sm text-muted-foreground">Loading…</p>
  </div>
)

const CmsPageContent = async ({
  slug,
  children,
}: {
  slug: string
  children?: ReactNode
}) => {
  await connection()
  const page = await requirePublishedPage(slug)
  return <CmsPageBody page={page}>{children}</CmsPageBody>
}

export const CmsPageRoute = ({
  slug,
  children,
}: {
  slug: string
  children?: ReactNode
}) => (
  <Suspense fallback={fallback}>
    <CmsPageContent slug={slug}>{children}</CmsPageContent>
  </Suspense>
)

export const loadCmsPageForMetadata = async (slug: string) => {
  await connection()
  return requirePublishedPage(slug)
}
