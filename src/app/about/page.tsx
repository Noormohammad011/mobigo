import type { Metadata } from "next"

import { CmsPageRoute, loadCmsPageForMetadata } from "@/components/content/cms-page-route"

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadCmsPageForMetadata("about")
  return { title: page.title, description: page.metaDescription ?? undefined }
}

export default function AboutPage() {
  return <CmsPageRoute slug="about" />
}
