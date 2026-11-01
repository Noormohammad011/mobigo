export type ThemePreference = "light" | "dark" | "system"

export const THEME_STORAGE_KEY = "mobigo-theme"

const listeners = new Set<() => void>()

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === "light" || v === "dark" || v === "system") return v
  } catch {
    /* storage blocked: fall back to system */
  }
  return "system"
}

/** Applies the resolved theme to <html>: the `dark` class (tokens) and color-scheme (native controls, scrollbars). */
function apply(pref: ThemePreference) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  const root = document.documentElement
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
}

export function refreshThemeOnDocument() {
  apply(readPreference())
}

export function subscribe(onChange: () => void) {
  listeners.add(onChange)
  // Re-apply on every mount: inline head script does not run on client navigations, and React can
  // reconcile <html className> back to the server value without the user’s `dark` class.
  apply(readPreference())
  // "system" must follow the OS live; other tabs changing the preference must follow too.
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  const onSystem = () => {
    if (readPreference() === "system") apply("system")
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) {
      apply(readPreference())
      onChange()
    }
  }
  mq.addEventListener("change", onSystem)
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    mq.removeEventListener("change", onSystem)
    window.removeEventListener("storage", onStorage)
  }
}

export const getSnapshot = readPreference
/** The server cannot know the preference; the switcher renders neutral until hydrated. */
export const getServerSnapshot = (): ThemePreference | null => null

export function setThemePreference(pref: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref)
  } catch {
    /* storage blocked: still apply for this page view */
  }
  // Switch instantly instead of animating every color on the page.
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  apply(pref)
  listeners.forEach((l) => l())
  queueMicrotask(() => apply(pref))
  window.getComputedStyle(document.body).opacity // flush styles before re-enabling transitions
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
}
