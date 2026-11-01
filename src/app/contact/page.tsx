import type { Metadata } from "next"

import { connection } from "next/server"

import { CmsPageRoute, loadCmsPageForMetadata } from "@/components/content/cms-page-route"
import { getStoreContact } from "@/lib/queries/shell"

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadCmsPageForMetadata("contact")
  return { title: page.title, description: page.metaDescription ?? undefined }
}

const ContactExtras = async () => {
  await connection()
  const contact = await getStoreContact()
  if (!contact.phone && !contact.email && !contact.whatsapp) return null

  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-4 text-body-sm">
      <h2 className="font-display text-h3 text-foreground">Reach us</h2>
      <ul className="mt-3 grid gap-2 text-muted-foreground">
        {contact.phone ? (
          <li>
            Phone:{" "}
            <a href={`tel:${contact.phone}`} className="text-link hover:underline">
              {contact.phone}
            </a>
          </li>
        ) : null}
        {contact.email ? (
          <li>
            Email:{" "}
            <a href={`mailto:${contact.email}`} className="text-link hover:underline">
              {contact.email}
            </a>
          </li>
        ) : null}
        {contact.whatsapp ? (
          <li>
            WhatsApp:{" "}
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              className="text-link hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat with us
            </a>
          </li>
        ) : null}
      </ul>
    </section>
  )
}

export default function ContactPage() {
  return (
    <CmsPageRoute slug="contact">
      <ContactExtras />
    </CmsPageRoute>
  )
}
