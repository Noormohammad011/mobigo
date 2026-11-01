"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

import { getServerSnapshot, getSnapshot, setThemePreference, subscribe, type ThemePreference } from "./theme-store"

const OPTIONS: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
]

/**
 * Light / Dark / System segmented control (radiogroup, arrow keys move selection).
 * `tone="inverse"` is for the always-dark header and footer; `tone="default"` follows the page theme.
 */
export function ThemeSwitcher({
  tone = "default",
  showLabels = false,
  className,
}: {
  tone?: "default" | "inverse"
  showLabels?: boolean
  className?: string
}) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const inverse = tone === "inverse"

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!step || !current) return
    e.preventDefault()
    const i = OPTIONS.findIndex((o) => o.value === current)
    const next = OPTIONS[(i + step + OPTIONS.length) % OPTIONS.length]
    setThemePreference(next.value)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-theme-option="${next.value}"]`)?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5",
        inverse ? "border-ink-700 bg-ink-900" : "border-border bg-muted",
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const checked = current === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={showLabels ? undefined : label}
            data-theme-option={value}
            tabIndex={checked || (current === null && value === "system") ? 0 : -1}
            onClick={() => setThemePreference(value)}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full text-caption font-semibold transition-colors duration-150 ease-brand outline-none focus-visible:ring-3 focus-visible:ring-ring/60 [&_svg]:size-4",
              showLabels ? "px-3" : "w-8",
              checked
                ? inverse
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground shadow-xs"
                : inverse
                  ? "text-ink-300 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon aria-hidden="true" strokeWidth={1.75} />
            {showLabels && label}
          </button>
        )
      })}
    </div>
  )
}
