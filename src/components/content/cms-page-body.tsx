import type { ReactNode } from "react"

type PageData = {
  title: string
  content: string
  updatedAt: Date
}

export const CmsPageBody = ({
  page,
  children,
}: {
  page: PageData
  children?: ReactNode
}) => (
  <article className="page-container max-w-3xl py-8 lg:py-12">
    <h1 className="font-display text-h1 text-foreground">{page.title}</h1>
    <p className="mt-2 text-caption text-muted-foreground">
      Updated {page.updatedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
    </p>
    <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-body text-foreground">{page.content}</div>
    {children}
  </article>
)
