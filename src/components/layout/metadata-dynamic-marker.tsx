import { Suspense } from "react"
import { connection } from "next/server"

/** Tells Next.js this route intentionally resolves URL specific metadata at request time. */
const ConnectionMarker = async () => {
  await connection()
  return null
}

export const MetadataDynamicMarker = () => (
  <Suspense fallback={null}>
    <ConnectionMarker />
  </Suspense>
)
