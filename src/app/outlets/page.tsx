import type { Metadata } from "next"
import { MapPinIcon } from "lucide-react"
import { connection } from "next/server"

import { CmsPageRoute, loadCmsPageForMetadata } from "@/components/content/cms-page-route"
import { getStoreContact } from "@/lib/queries/shell"

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadCmsPageForMetadata("outlets")
  return { title: page.title, description: page.metaDescription ?? undefined }
}

const OutletList = async () => {
  await connection()
  const contact = await getStoreContact()
  if (contact.outlets.length === 0) return null

  return (
    <ul className="mt-8 flex flex-col gap-4">
      {contact.outlets.map((outlet) => (
        <li key={outlet.name} className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-display text-h3 text-foreground">{outlet.name}</h2>
          {outlet.mapUrl ? (
            <a
              href={outlet.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex gap-2 text-body-sm text-muted-foreground hover:text-foreground"
            >
              <MapPinIcon className="size-4 shrink-0" aria-hidden />
              {outlet.address}
            </a>
          ) : (
            <p className="mt-2 inline-flex gap-2 text-body-sm text-muted-foreground">
              <MapPinIcon className="size-4 shrink-0" aria-hidden />
              {outlet.address}
            </p>
          )}
          {outlet.phone ? <p className="mt-1 text-body-sm">{outlet.phone}</p> : null}
          {outlet.hours ? <p className="mt-1 text-caption text-muted-foreground">{outlet.hours}</p> : null}
        </li>
      ))}
    </ul>
  )
}

export default function OutletsPage() {
  return (
    <CmsPageRoute slug="outlets">
      <OutletList />
    </CmsPageRoute>
  )
}
