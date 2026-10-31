import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"

import { BottomNavFallback } from "@/components/layout/bottom-nav-fallback"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SkipLink } from "@/components/layout/skip-link"
import { WhatsAppButton } from "@/components/layout/whatsapp-button"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

// DESIGN_SYSTEM §3: Inter for body/UI, Plus Jakarta Sans for headings and prices.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "MobiGo", template: "%s · MobiGo" },
  description: "Phones in Bangladesh. Pay when it arrives.",
}

export const viewport: Viewport = {
  themeColor: "#0b0b12", // --color-header
  viewportFit: "cover", // lets sticky bars use env(safe-area-inset-bottom)
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Body bottom padding clears the fixed BottomNav below lg (64px + safe area); it sits under the footer.
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
        <TooltipProvider>
          <SkipLink />
          <Header />
          <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </main>
          <Footer />
          <Suspense fallback={<BottomNavFallback />}>
            <BottomNav />
          </Suspense>
          <WhatsAppButton />
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}
