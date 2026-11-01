import { MessageCircleIcon } from "lucide-react"

import { getStoreContact } from "@/lib/queries/shell"

/**
 * PRD G-6: floating WhatsApp contact, above the bottom nav below lg (z-float, §4).
 * Hidden until a whatsapp_number setting exists.
 */
export async function WhatsAppButton() {
  const { whatsapp } = await getStoreContact()
  if (!whatsapp) return null

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MobiGo on WhatsApp"
      className="fixed right-3 bottom-[calc(var(--bottom-chrome,64px)+env(safe-area-inset-bottom)+12px)] z-float inline-flex size-11 items-center justify-center rounded-full bg-save-600 text-white shadow-lg transition-transform duration-150 ease-brand outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 motion-reduce:transition-none lg:right-6 lg:bottom-6 lg:size-13"
    >
      <MessageCircleIcon className="size-6 lg:size-7" strokeWidth={1.75} aria-hidden="true" />
    </a>
  )
}
