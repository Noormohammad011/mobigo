import { Suspense } from "react"

import { ComparePill } from "@/components/compare/compare-pill"
import { isFlagOn } from "@/lib/flags"

const Pill = async () => {
  const enabled = await isFlagOn("compare")
  return <ComparePill enabled={enabled} />
}

export const ComparePillSlot = () => (
  <Suspense fallback={null}>
    <Pill />
  </Suspense>
)
