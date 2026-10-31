// Single source for shell routes so header, menu, bottom nav and footer stay in sync.
// Budget bands use /phones?minPrice=&maxPrice= (agreed with the home page's budget tiles).

export type NavBrand = { name: string; slug: string }

export const BUDGET_BANDS = [
  { label: "Under ৳15k", href: "/phones?maxPrice=15000" },
  { label: "৳15k–30k", href: "/phones?minPrice=15000&maxPrice=30000" },
  { label: "৳30k–60k", href: "/phones?minPrice=30000&maxPrice=60000" },
  { label: "৳60k–100k", href: "/phones?minPrice=60000&maxPrice=100000" },
  { label: "৳100k+", href: "/phones?minPrice=100000" },
] as const

export const HELP_LINKS = [
  { label: "Track your order", href: "/track" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact us", href: "/contact" },
  { label: "About MobiGo", href: "/about" },
  { label: "Our outlets", href: "/outlets" },
] as const

// CMS pages (Page table slugs, PRD §4.11).
export const POLICY_LINKS = [
  { label: "Warranty policy", href: "/pages/warranty-policy" },
  { label: "Delivery policy", href: "/pages/delivery-policy" },
  { label: "Return & refund", href: "/pages/return-refund-policy" },
  { label: "Privacy policy", href: "/pages/privacy-policy" },
  { label: "Terms of service", href: "/pages/terms" },
] as const

export const NAV_BRAND_LIMIT = 10
