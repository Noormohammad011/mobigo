import { BanknoteIcon, ChevronDownIcon, MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from "lucide-react"
import { cacheLife } from "next/cache"
import Link from "next/link"
import type { ReactNode } from "react"

import { Wordmark } from "@/components/brand/wordmark"
import { getNavBrands, getStoreContact, type StoreContact } from "@/lib/queries/shell"

import { HELP_LINKS, NAV_BRAND_LIMIT, POLICY_LINKS } from "./nav"

type LinkItem = { label: string; href: string }
type Group = { id: string; title: string; links: LinkItem[] }

/**
 * PRD G-7, DESIGN_SYSTEM §7.18. ink-950 band: contact, outlets, brands, help, policies.
 * < md: link groups are <details> accordions (no JS). md: 2 columns. lg: 4 columns.
 * Contact, socials and outlets come from Settings/Outlet; each block hides when empty.
 */
export async function Footer() {
  const [brands, contact, year] = await Promise.all([getNavBrands(), getStoreContact(), currentYear()])

  const groups: Group[] = [
    {
      id: "brands",
      title: "Shop by brand",
      links: [
        { label: "All phones", href: "/phones" },
        ...brands.slice(0, NAV_BRAND_LIMIT).map((b) => ({ label: b.name, href: `/brands/${b.slug}` })),
      ],
    },
    { id: "help", title: "Help", links: [...HELP_LINKS] },
    { id: "policies", title: "Policies", links: [...POLICY_LINKS] },
  ]
  const socials = [
    { label: "Facebook", href: contact.socials.facebook },
    { label: "YouTube", href: contact.socials.youtube },
  ].filter((s): s is LinkItem => Boolean(s.href))

  return (
    <footer className="bg-header text-header-foreground">
      <div className="page-container grid gap-10 py-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16 lg:py-14">
        <section aria-label="About MobiGo" className="grid content-start gap-5">
          <Link href="/" aria-label="MobiGo home" className="w-fit rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-primary-400">
            <Wordmark className="text-2xl" />
          </Link>
          <p className="max-w-sm text-body-sm text-ink-300">
            Genuine phones from every major brand, delivered across Bangladesh. Pay when it arrives.
          </p>

          {(contact.phone || contact.email || contact.whatsapp) && (
            <ul className="grid gap-3 text-body-sm">
              {contact.phone && (
                <ContactItem icon={<PhoneIcon />} href={`tel:${contact.phone}`} label="Call us">
                  {contact.phone}
                </ContactItem>
              )}
              {contact.whatsapp && (
                <ContactItem icon={<MessageCircleIcon />} href={`https://wa.me/${contact.whatsapp}`} label="WhatsApp" external>
                  Chat on WhatsApp
                </ContactItem>
              )}
              {contact.email && (
                <ContactItem icon={<MailIcon />} href={`mailto:${contact.email}`} label="Email">
                  {contact.email}
                </ContactItem>
              )}
            </ul>
          )}

          {socials.length > 0 && (
            <ul aria-label="Follow MobiGo" className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-full border border-ink-700 px-4 text-body-sm font-medium text-header-foreground transition-colors duration-150 ease-brand outline-none hover:border-primary-400 hover:text-primary-400 focus-visible:ring-3 focus-visible:ring-primary-400"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-0 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {groups.map((group) => (
            <FooterGroup key={group.id} group={group} />
          ))}
          {contact.outlets.length > 0 && (
            <OutletsGroup outlets={contact.outlets} />
          )}
        </div>
      </div>

      <div className="border-t border-ink-900">
        {/* pr-20 keeps this row clear of the floating WhatsApp button. */}
        <div className="page-container flex flex-col gap-3 py-5 pr-20 text-caption text-ink-300 sm:flex-row sm:items-center sm:justify-between lg:pr-24">
          <p>© {year} MobiGo. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <BanknoteIcon className="size-4 text-save-600" strokeWidth={1.75} aria-hidden="true" />
            Cash on Delivery across Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}

async function currentYear() {
  "use cache"
  cacheLife("days")
  return new Date().getFullYear()
}

function ContactItem({
  icon,
  href,
  label,
  external,
  children,
}: {
  icon: ReactNode
  href: string
  label: string
  external?: boolean
  children: ReactNode
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group inline-flex min-h-11 items-center gap-3 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-primary-400"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-primary-400 [&_svg]:size-[18px]" aria-hidden="true">
          {icon}
        </span>
        <span className="grid">
          <span className="text-caption text-ink-300">{label}</span>
          <span className="font-medium group-hover:text-primary-400">{children}</span>
        </span>
      </a>
    </li>
  )
}

const footerLink =
  "inline-flex min-h-11 items-center rounded-sm text-body-sm text-ink-300 transition-colors duration-150 ease-brand outline-none hover:text-header-foreground focus-visible:ring-3 focus-visible:ring-primary-400 md:min-h-9"

function GroupLinks({ links }: { links: LinkItem[] }) {
  return (
    <ul className="grid gap-0.5 pb-4 md:pb-0">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={footerLink}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

// Mobile: <details> accordion. md+: always-open column (the summary becomes a static heading).
function FooterGroup({ group }: { group: Group }) {
  return (
    <section aria-labelledby={`footer-${group.id}`} className="border-b border-ink-900 md:border-0">
      <details className="group/acc md:hidden">
        <Summary id={`footer-${group.id}-m`}>{group.title}</Summary>
        <GroupLinks links={group.links} />
      </details>
      <div className="hidden md:block">
        <h2 id={`footer-${group.id}`} className="mb-3 text-overline text-header-foreground uppercase">
          {group.title}
        </h2>
        <GroupLinks links={group.links} />
      </div>
    </section>
  )
}

function OutletsGroup({ outlets }: { outlets: StoreContact["outlets"] }) {
  const list = (
    <ul className="grid gap-4 pb-4 md:pb-0">
      {outlets.map((o) => (
        <li key={o.name} className="grid gap-1 text-body-sm">
          <span className="font-medium text-header-foreground">{o.name}</span>
          {o.mapUrl ? (
            <a href={o.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1.5 text-ink-300 hover:text-header-foreground">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {o.address}
            </a>
          ) : (
            <span className="inline-flex gap-1.5 text-ink-300">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {o.address}
            </span>
          )}
          {o.hours && <span className="text-caption text-ink-300">{o.hours}</span>}
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-labelledby="footer-outlets" className="border-b border-ink-900 md:border-0">
      <details className="group/acc md:hidden">
        <Summary id="footer-outlets-m">Outlets</Summary>
        {list}
      </details>
      <div className="hidden md:block">
        <h2 id="footer-outlets" className="mb-3 text-overline text-header-foreground uppercase">
          Outlets
        </h2>
        {list}
      </div>
    </section>
  )
}

function Summary({ id, children }: { id: string; children: ReactNode }) {
  return (
    <summary
      id={id}
      className="flex h-12 cursor-pointer list-none items-center justify-between text-body-sm font-semibold text-header-foreground outline-none focus-visible:ring-3 focus-visible:ring-primary-400 [&::-webkit-details-marker]:hidden"
    >
      {children}
      <ChevronDownIcon
        className="size-5 text-ink-300 transition-transform duration-250 ease-brand group-open/acc:rotate-180 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </summary>
  )
}
