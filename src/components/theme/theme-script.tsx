import { THEME_STORAGE_KEY } from "./theme-store"

/**
 * Runs before first paint so a dark-mode visitor never sees a white flash.
 * Rendered in <head> of the root layout; the same logic as theme-store's apply().
 */
const code = `(function(){try{var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=p==="dark"||((p!=="light")&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`

export function ThemeScript() {
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: code }} />
}
