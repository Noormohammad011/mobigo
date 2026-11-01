import Link from "next/link"

import { cn } from "@/lib/utils"

const linkClass =
  "rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary-400 hover:bg-muted"

export default function AdminSettingsHubPage() {
  const sections = [
    { href: "/admin/settings/contact", title: "Contact & store", desc: "Phone, email, WhatsApp, social links, order cap" },
    { href: "/admin/settings/delivery-zones", title: "Delivery zones", desc: "Fees, ETA, districts for checkout" },
    { href: "/admin/settings/outlets", title: "Outlets", desc: "Showroom addresses in the footer and outlets page" },
    { href: "/admin/settings/pages", title: "Content pages", desc: "About, FAQ, policies, and other CMS pages" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-h1 text-foreground">Settings & content</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.href}>
            <Link href={section.href} className={cn(linkClass, "flex flex-col gap-1")}>
              <span className="font-display text-h3 text-foreground">{section.title}</span>
              <span className="text-body-sm text-muted-foreground">{section.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
