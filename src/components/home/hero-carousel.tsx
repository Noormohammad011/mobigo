"use client"

import { getImageProps } from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { PauseIcon, PlayIcon } from "lucide-react"

import type { HomeBanner } from "@/lib/queries/home"
import { cn } from "@/lib/utils"

const AUTOPLAY_MS = 5000

/** <picture> with separate mobile (16:9) and desktop (21:9) art (DESIGN_SYSTEM §5). */
function BannerPicture({ banner, priority, className }: { banner: HomeBanner; priority: boolean; className?: string }) {
  const common = { alt: banner.alt, sizes: "(min-width: 1024px) 66vw, 100vw", priority, loading: priority ? undefined : ("lazy" as const) }
  const svg = (src: string) => src.endsWith(".svg")
  const desktop = getImageProps({ ...common, src: banner.desktop, width: 1920, height: 820, unoptimized: svg(banner.desktop) }).props
  const { srcSet: mobileSet, ...img } = getImageProps({
    ...common,
    src: banner.mobile,
    width: 1080,
    height: 608,
    unoptimized: svg(banner.mobile),
  }).props
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktop.srcSet ?? desktop.src} />
      <source srcSet={mobileSet ?? img.src} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...img} className={cn("size-full object-cover", className)} />
    </picture>
  )
}

function Slide({ banner, priority }: { banner: HomeBanner; priority: boolean }) {
  const pic = <BannerPicture banner={banner} priority={priority} />
  return banner.href ? (
    <Link href={banner.href} className="block size-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset">
      {pic}
    </Link>
  ) : (
    pic
  )
}

/**
 * HeroCarousel — DESIGN_SYSTEM §7.14, PRD H-1.
 * Native scroll-snap gives touch swipe for free. Autoplay (5s) pauses on hover, focus
 * and touch, stops for reduced motion, and has a visible pause control (WCAG 2.2.2).
 */
export function HeroCarousel({ slides, side }: { slides: HomeBanner[]; side: HomeBanner[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const goTo = useCallback(
    (i: number) => {
      const el = track.current
      if (!el) return
      const next = (i + slides.length) % slides.length
      el.scrollTo({ left: next * el.clientWidth, behavior: reducedMotion ? "auto" : "smooth" })
    },
    [slides.length, reducedMotion]
  )

  const playing = slides.length > 1 && !userPaused && !interacting && !reducedMotion
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [playing, index, goTo])

  const onScroll = () => {
    const el = track.current
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (slides.length === 0) return null

  return (
    <div className="grid gap-3 lg:grid-cols-3 lg:gap-5">
      <section
        aria-roledescription="carousel"
        aria-label="Featured offers"
        className="relative overflow-hidden rounded-xl bg-ink-950 lg:col-span-2"
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocus={() => setInteracting(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setInteracting(false)}
        onTouchStart={() => setInteracting(true)}
        onTouchEnd={() => setInteracting(false)}
      >
        <div
          ref={track}
          onScroll={onScroll}
          aria-live={playing ? "off" : "polite"}
          className="scrollbar-none flex aspect-video snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:aspect-[21/9]"
        >
          {slides.map((b, i) => (
            <div
              key={b.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              inert={i !== index}
              className="size-full shrink-0 snap-start"
            >
              <Slide banner={b} priority={i === 0} />
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-linear-to-t from-black/35 to-transparent px-3 pt-6 pb-2">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              className="absolute left-2 grid size-9 place-items-center rounded-full text-white outline-none hover:bg-white/15 focus-visible:ring-3 focus-visible:ring-white/60 [&_svg]:size-4"
            >
              {userPaused ? <PlayIcon aria-hidden="true" /> : <PauseIcon aria-hidden="true" />}
            </button>
            {slides.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="group/dot grid h-6 place-items-center px-1 outline-none"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all duration-250 ease-brand group-focus-visible/dot:ring-2 group-focus-visible/dot:ring-white",
                    i === index ? "w-6 bg-primary" : "w-2 bg-white/70"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {side.length > 0 && (
        <div className="hidden lg:grid lg:h-full lg:grid-rows-2 lg:gap-5">
          {side.map((b) => (
            // Absolutely positioned, so the tiles take their height from the carousel's row.
            <div key={b.id} className="relative min-h-0 overflow-hidden rounded-xl bg-ink-950">
              <div className="absolute inset-0">
                <Slide banner={b} priority={false} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
