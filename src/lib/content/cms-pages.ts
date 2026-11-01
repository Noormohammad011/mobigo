/** Fixed CMS slugs (PRD §4.11). Admin edits content; slugs stay stable for footer links. */
export const CMS_PAGE_SLUGS = [
  "about",
  "contact",
  "faq",
  "outlets",
  "privacy-policy",
  "warranty-policy",
  "delivery-policy",
  "return-refund-policy",
  "terms",
] as const

export type CmsPageSlug = (typeof CMS_PAGE_SLUGS)[number]

export const cmsPagePath = (slug: string) => {
  if (slug === "about") return "/about"
  if (slug === "contact") return "/contact"
  if (slug === "faq") return "/faq"
  if (slug === "outlets") return "/outlets"
  return `/pages/${slug}`
}

export const cmsPageLabel = (slug: string) => {
  const labels: Record<string, string> = {
    about: "About MobiGo",
    contact: "Contact us",
    faq: "FAQs",
    outlets: "Our outlets",
    "privacy-policy": "Privacy policy",
    "warranty-policy": "Warranty policy",
    "delivery-policy": "Delivery policy",
    "return-refund-policy": "Return & refund",
    terms: "Terms of service",
  }
  return labels[slug] ?? slug
}
