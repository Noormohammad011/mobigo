import type { Metadata } from "next"

import { Showcase } from "./showcase"

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
}

export default function DesignSystemPage() {
  return <Showcase />
}
