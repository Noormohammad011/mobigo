import type { Metadata } from "next"

import { CmsPageRoute, loadCmsPageForMetadata } from "@/components/content/cms-page-route"

const POLICY_SLUGS = [
  "privacy-policy",
  "warranty-policy",
  "delivery-policy",
  "return-refund-policy",
  "terms",
] as const

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await loadCmsPageForMetadata(slug)
  return {
    title: page.title,
    description: page.metaDescription ?? undefined,
  }
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  return <CmsPageRoute slug={slug} />
}
