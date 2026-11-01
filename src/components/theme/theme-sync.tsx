"use client"

import { useLayoutEffect, useSyncExternalStore } from "react"

import { getServerSnapshot, getSnapshot, refreshThemeOnDocument, subscribe } from "./theme-store"

/** Keeps `<html>` in sync with stored preference after hydration and client navigations. */
export function ThemeSync() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useLayoutEffect(() => {
    const sync = () => refreshThemeOnDocument()
    sync()
    // Root layout sets <html className> from the server; React reconciliation drops `dark`.
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return null
}
